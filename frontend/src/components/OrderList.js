// src/components/OrderList.js
import React, { useState, useEffect } from 'react';
import './OrderList.css';

// Add this line at the top
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both orders and menu items
      const [ordersRes, menuRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`),
        fetch(`${API_URL}/api/menu`)
      ]);

      if (!ordersRes.ok || !menuRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();

      setOrders(ordersData.data);
      setMenuItems(menuData.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const formatDate = (dateValue, includeTime = false) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';

      const options = includeTime
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

      return date.toLocaleDateString('en-NZ', options);
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateDDMMYYYY = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="order-list-container">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p className="orders-count">Total Orders: {orders.length}</p>
      </div>

      <button onClick={handlePrint} className="print-btn" title="Print Orders">
        🖨️
      </button>

      <div className="orders-grid">
        {orders.map(order => {
          // Helper function to get price from menu if missing
          const getItemPrice = (item) => {
            if (item.unitPrice) return item.unitPrice;

            // Try to find matching menu item by name
            const menuItem = menuItems.find(m => m.name === item.name);
            return menuItem ? menuItem.price : 0;
          };

          // Calculate total from items if totalAmount is missing
          const orderTotal = order.totalAmount ||
            order.items.reduce((sum, item) => {
              const unitPrice = getItemPrice(item);
              const itemTotal = item.subtotal || (unitPrice * item.quantity) || 0;
              return sum + itemTotal;
            }, 0);

          return (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderNumber || order.id}</h3>
                <span className={`status-badge ${order.paymentStatus || 'pending'}`}>
                  {order.paymentStatus || 'pending'}
                </span>
              </div>

              <div className="order-section">
                <h4>Student Information</h4>
                <p><strong>Name:</strong> {order.studentName || 'N/A'}</p>
                <p><strong>Room:</strong> {order.room || 'N/A'}</p>
                <p><strong>School:</strong> {order.school || 'N/A'}</p>
              </div>

              <div className="order-section">
                <h4>Order Details</h4>
                <p><strong>Order Placed:</strong> {formatDateDDMMYYYY(order.createdAt || order.date)}</p>
                <p><strong>Delivery Date:</strong> {formatDateDDMMYYYY(order.deliveryDate || order.date)}</p>
              </div>

            <div className="order-section">
              <h4>Items</h4>
              <ul className="items-list">
                {order.items.map((item, index) => {
                  const unitPrice = getItemPrice(item);
                  const subtotal = item.subtotal || (unitPrice * item.quantity) || 0;
                  return (
                    <li key={index} className="order-item">
                      <div className="item-header">
                        <span className="item-name">{item.quantity}x {item.name}</span>
                        <span className="item-price">${subtotal.toFixed(2)}</span>
                      </div>
                      {item.riceType && (
                        <p className="item-detail"><strong>Rice:</strong> {item.riceType}</p>
                      )}
                      {item.specialNotes && (
                        <div className="item-notes">
                          <strong>Notes:</strong> {item.specialNotes}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

              <div className="order-footer">
                <strong>Total:</strong>
                <strong>${orderTotal.toFixed(2)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderList;