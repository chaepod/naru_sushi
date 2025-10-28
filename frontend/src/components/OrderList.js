// src/components/OrderList.js
import React, { useState, useEffect } from 'react';
import './OrderList.css';

// Add this line at the top
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Use API_URL variable
      const response = await fetch(`${API_URL}/api/orders`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      
      setOrders(data.data);
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

  return (
    <div className="order-list-container">
      <h2>Orders ({orders.length})</h2>
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <h3>{order.studentName}</h3>
            <p>{order.room}</p>
            <p>{order.school}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.name}
                  {item.customizations.length > 0 && 
                    ` (${item.customizations.join(', ')})`
                  }
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderList;