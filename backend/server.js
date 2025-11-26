// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// GET /api/orders - Get all orders with their items
app.get('/api/orders', async (req, res) => {
  try {
    // Fetch orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (ordersError) throw ordersError;

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        return {
          id: order.id,
          orderNumber: order.order_number,
          studentName: order.student_name,
          room: order.room,
          school: order.school,
          date: order.date,
          deliveryDate: order.delivery_date,
          parentName: order.parent_name,
          parentEmail: order.parent_email,
          phone: order.phone,
          totalAmount: order.total_amount,
          status: order.status,
          paymentStatus: order.payment_status,
          createdAt: order.created_at,
          items: items.map(item => {
            // For backward compatibility, if customizations array exists and has items,
            // extract rice type and special notes from it
            const customizations = item.customizations || [];
            let riceType = item.rice_type;
            let specialNotes = item.special_notes;

            // If we have customizations but no rice_type/special_notes, parse them
            if (customizations.length > 0 && !specialNotes) {
              // First item is usually rice type
              if (customizations[0]) {
                riceType = riceType || customizations[0];
              }
              // Remaining items are special notes
              if (customizations.length > 1) {
                specialNotes = customizations.slice(1).join('\n');
              }
            }

            return {
              name: item.item_name,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              subtotal: item.subtotal,
              riceType: riceType,
              specialNotes: specialNotes,
              customizations: customizations
            };
          })
        };
      })
    );

    res.json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/menu - Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/production-list - Get production summary
app.get('/api/production-list', async (req, res) => {
  try {
    // Fetch all order items
    const { data: items, error } = await supabase
      .from('order_items')
      .select('item_name, quantity, customizations');

    if (error) throw error;

    // Aggregate by item + customizations
    const productionSummary = {};
    
    items.forEach(item => {
      const customizationsStr = (item.customizations || []).join(' ');
      const key = `${item.item_name} ${customizationsStr}`.trim();
      
      if (productionSummary[key]) {
        productionSummary[key] += item.quantity;
      } else {
        productionSummary[key] = item.quantity;
      }
    });
    
    const productionList = Object.entries(productionSummary)
      .map(([item, quantity]) => ({ item, quantity }))
      .sort((a, b) => b.quantity - a.quantity);
    
    res.json({
      success: true,
      data: productionList
    });
  } catch (error) {
    console.error('Error generating production list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/schools - Get all active schools
app.get('/api/schools', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, address')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize Stripe (add this after Supabase initialization, around line 14)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/create-payment-intent - Create Stripe payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, metadata } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'nzd', // New Zealand Dollars
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { cart, customerInfo, paymentIntentId, totalAmount } = req.body;

    // Validate required fields
    if (!cart || !cart.length || !customerInfo || !paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Generate unique order number
    const orderNumber = `NS${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Group cart items by delivery date and student
    const orderGroups = {};
    
    cart.forEach(item => {
      const key = `${item.deliveryDate}-${item.studentName}-${item.school}-${item.roomNumber}`;
      if (!orderGroups[key]) {
        orderGroups[key] = {
          deliveryDate: item.deliveryDate,
          studentName: item.studentName,
          school: item.school,
          roomNumber: item.roomNumber,
          items: []
        };
      }
      orderGroups[key].items.push(item);
    });

    // Create orders for each group
    const createdOrders = [];
    
    for (const [key, group] of Object.entries(orderGroups)) {
      // Calculate subtotal for this order
      const orderTotal = group.items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          student_name: group.studentName,
          room: group.roomNumber,
          school: group.school,
          date: group.deliveryDate,
          delivery_date: group.deliveryDate,
          parent_name: customerInfo.parentName,
          parent_email: customerInfo.parentEmail,
          phone: customerInfo.phone,
          total_amount: orderTotal,
          payment_status: 'pending',
          payment_intent_id: paymentIntentId,
          status: 'pending',
          order_number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = group.items.map(item => ({
        order_id: order.id,
        item_name: item.menuItem.name,
        quantity: item.quantity,
        menu_item_id: item.menuItem.id,
        unit_price: item.menuItem.price,
        subtotal: item.totalPrice,
        rice_type: item.riceType,
        special_notes: item.notes,
        delivery_date: item.deliveryDate,
        customizations: [item.riceType, item.notes].filter(Boolean)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      createdOrders.push(order);
    }

    res.json({
      success: true,
      orderNumber: orderNumber,
      orders: createdOrders,
      totalAmount: totalAmount
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber);

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;

        return {
          ...order,
          items: items
        };
      })
    );

    res.json({
      success: true,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/webhook - Stripe webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    // Update order payment status
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentIntent.id);

    if (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    console.log(`Payment succeeded for PaymentIntent: ${paymentIntent.id}`);
    
    // TODO: Send confirmation email here
  }

  res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Supabase: ${process.env.SUPABASE_URL}`);
});

/* In another terminal or browser, test the endpoints:
# http://localhost:5000/api/orders
# http://localhost:5000/api/menu
# http://localhost:5000/api/production-list */