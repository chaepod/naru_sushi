import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(true); // Always start with loading true
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    // Always fetch order details to get items, even if we have orderData from state
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderNumber}`);
      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        // The API returns an array of orders with the same order number
        // We need to aggregate all items from all orders
        const orders = data.data;

        // Collect all items from all orders
        const allItems = orders.flatMap(order =>
          (order.items || []).map(item => ({
            ...item,
            student_name: order.student_name,
            room: order.room,
            school: order.school
          }))
        );

        // Calculate the total amount from all orders with this order number
        const totalAmount = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        // Use the first order as the base, but add all items and correct total
        const aggregatedOrder = {
          ...orders[0],
          items: allItems,
          total_amount: totalAmount
        };

        // Merge with existing state data to preserve totalAmount and other fields
        setOrderData(prev => ({
          ...prev,
          ...aggregatedOrder
        }));
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current || downloading) return;

    const element = receiptRef.current;

    try {
      setDownloading(true);

      // Add a temporary class for PDF generation to make it more compact
      element.classList.add('pdf-export');

      const opt = {
        margin: [0.4, 1, 0.4, 1], // top, right, bottom, left margins
        filename: `Receipt_${orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          windowWidth: 700,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: {
          unit: 'in',
          format: 'letter',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

      // Remove the temporary class
      element.classList.remove('pdf-export');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Remove the temporary class in case of error
      element.classList.remove('pdf-export');
      // Fallback to print dialog
      window.print();
    } finally {
      setDownloading(false);
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
      <div className="confirmation-container" ref={receiptRef}>
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
            <span className="value">${(orderData.total_amount || orderData.totalAmount)?.toFixed(2)} NZD</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className="value status-paid">Paid</span>
          </div>
          {(orderData.delivery_date || orderData.deliveryDate) && (
            <div className="detail-row">
              <span className="label">Delivery Date:</span>
              <span className="value">{new Date(orderData.delivery_date || orderData.deliveryDate).toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Order Items */}
        {orderData.items && orderData.items.length > 0 && (
          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="order-items-list">
              {orderData.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="item-info">
                    <div className="item-name">{item.item_name || item.menu_item_name}</div>
                    <div className="item-details-text">
                      Student: {item.student_name}
                    </div>
                    <div className="item-details-text">
                      Room: {item.room}
                    </div>
                    <div className="item-details-text">
                      School: {item.school}
                    </div>
                    <div className="item-details-text">
                      Rice: {item.rice_type}
                    </div>
                    {(item.special_notes || item.notes) && (
                      <div className="item-notes-text">Notes: {item.special_notes || item.notes}</div>
                    )}
                  </div>
                  <div className="item-qty-price">
                    <div className="item-quantity">Qty: {item.quantity}</div>
                    <div className="item-price">${(item.unit_price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="confirmation-info">
          <h3>What's Next?</h3>
          <ul>
            <li>Your order will be prepared and delivered to the classroom at lunchtime</li>
            <li>Delivery is scheduled between 12:00 PM - 1:00 PM</li>
            <li>Please contact us if you have any questions about your order</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="primary-btn">
            Order More
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="secondary-btn"
            disabled={downloading}
            title="Download receipt as PDF"
          >
            {downloading ? 'Generating PDF...' : 'Download as PDF'}
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