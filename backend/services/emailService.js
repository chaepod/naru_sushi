// backend/services/emailService.js
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not set. Email functionality will be disabled.');
}

/**
 * Sends an order confirmation email to the customer
 * @param {Object} orderData - Order data from database
 * @param {Array} orderItems - Array of order items
 */
const sendOrderConfirmation = async (orderData, orderItems = []) => {
  // Skip if SendGrid is not configured
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    console.log('Email service not configured. Skipping email send.');
    return;
  }

  // Format items for email
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ecf0f1;">${item.item_name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ecf0f1;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ecf0f1;">$${item.unit_price.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ecf0f1;">$${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  const msg = {
    to: orderData.parent_email,
    from: process.env.FROM_EMAIL,
    subject: `Order Confirmation - ${orderData.order_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .order-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #7f8c8d; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #3498db; color: white; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #27ae60; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Order!</h1>
          </div>

          <div class="content">
            <p>Dear ${orderData.parent_name},</p>

            <p>Your order <strong>#${orderData.order_number}</strong> has been confirmed and will be prepared fresh for delivery.</p>

            <div class="order-details">
              <h2 style="color: #2c3e50; margin-top: 0;">Delivery Details</h2>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Student Name:</strong> ${orderData.student_name}</li>
                <li><strong>Room:</strong> ${orderData.room}</li>
                <li><strong>School:</strong> ${orderData.school}</li>
                <li><strong>Delivery Date:</strong> ${new Date(orderData.delivery_date).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Delivery Time:</strong> 12:00 PM - 1:00 PM (Lunch hours)</li>
              </ul>
            </div>

            ${orderItems.length > 0 ? `
            <div class="order-details">
              <h2 style="color: #2c3e50; margin-top: 0;">Order Items</h2>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div class="total">
                Total: $${orderData.total_amount.toFixed(2)} NZD
              </div>
            </div>
            ` : ''}

            <div class="order-details">
              <h2 style="color: #2c3e50; margin-top: 0;">Important Information</h2>
              <ul>
                <li>Your order will be delivered during lunch hours (12:00 PM - 1:00 PM)</li>
                <li>All meals are freshly prepared on the day of delivery</li>
                <li>Orders placed on the day must be received by 9:00 AM</li>
              </ul>
            </div>

            <p>If you have any questions about your order, please don't hesitate to contact us.</p>

            <p>Thank you for choosing Naru Sushi!</p>
          </div>

          <div class="footer">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} Naru Sushi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Confirmation email sent to ${orderData.parent_email} for order ${orderData.order_number}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error.message);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Sends a payment failure notification email
 * @param {Object} orderData - Order data from database
 */
const sendPaymentFailureEmail = async (orderData) => {
  // Skip if SendGrid is not configured
  if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
    console.log('Email service not configured. Skipping email send.');
    return;
  }

  const msg = {
    to: orderData.parent_email,
    from: process.env.FROM_EMAIL,
    subject: `Payment Issue - Order ${orderData.order_number}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #7f8c8d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Issue Detected</h1>
          </div>

          <div class="content">
            <p>Dear ${orderData.parent_name},</p>

            <p>We encountered an issue processing your payment for order <strong>#${orderData.order_number}</strong>.</p>

            <p>Please contact us to complete your order, or you can place a new order on our website.</p>

            <p>We apologize for any inconvenience.</p>
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Naru Sushi. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Payment failure email sent to ${orderData.parent_email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending payment failure email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentFailureEmail
};
