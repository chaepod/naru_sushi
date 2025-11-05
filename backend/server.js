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
          studentName: order.student_name,
          room: order.room,
          school: order.school,
          date: order.date,
          items: items.map(item => ({
            name: item.item_name,
            quantity: item.quantity,
            customizations: item.customizations || []
          }))
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