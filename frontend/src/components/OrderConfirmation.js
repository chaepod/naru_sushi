import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!orderData);

  useEffect(() => {
    if (!orderData && orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderNumber}`);
      const data = await response.json();
      
      if (data.success) {
        setOrderData(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="confirmation-page">
        <div className="error">
          <h2>Order Not Found</h2>
          <button onClick={() => navigate('/')}>Return to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-message">
          Thank you for your order! Your payment has been processed successfully.
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order Number:</span>
            <span className="value order-number">{orderNumber}</span>
          </div>
          <div className="detail-row">
            <span className="label">Total Amount:</span>
            <span className="value">${orderData.totalAmount?.toFixed(2)} NZD</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className="value status-paid">Paid</span>
          </div>
        </div>

        <div className="confirmation-info">
          <h3>What's Next?</h3>
          <ul>
            <li>A confirmation email has been sent to your email address</li>
            <li>Your order will be prepared and delivered to the classroom at lunchtime</li>
            <li>Delivery is scheduled between 12:00 PM - 1:00 PM</li>
            <li>Please contact us if you have any questions about your order</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="primary-btn">
            Order More
          </button>
          <button onClick={() => window.print()} className="secondary-btn">
            Print Receipt
          </button>
        </div>

        <p className="support-info">
          Need help? Contact us at <a href="mailto:info@narusushi.co.nz">info@narusushi.co.nz</a>
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;