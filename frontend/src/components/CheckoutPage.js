import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import { useCart } from '../hooks/useCart';
import CheckoutForm from './CheckoutForm';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, getTotalItems } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    parentName: '',
    parentEmail: '',
    phone: ''
  });
  const [deliveryDate, setDeliveryDate] = useState('');
  const [dateError, setDateError] = useState('');

  const totalAmount = getTotalPrice();

  // Calculate minimum delivery date (considering 9am cutoff)
  const getMinDeliveryDate = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // If it's past 9am OR if it's a past date, minimum date is tomorrow
    if (currentHour >= 9) {
      now.setDate(now.getDate() + 1);
    }

    // Format as YYYY-MM-DD in local timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Validate delivery date
  const validateDeliveryDate = (date) => {
    if (!date) {
      setDateError('Please select a delivery date');
      return false;
    }

    const minDateStr = getMinDeliveryDate();

    // Compare date strings directly (YYYY-MM-DD format)
    if (date < minDateStr) {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour >= 9) {
        setDateError('Orders after 9:00 AM must be for the next day or later');
      } else {
        setDateError('Please select a valid delivery date');
      }
      return false;
    }

    setDateError('');
    return true;
  };

  const handleDeliveryDateChange = (e) => {
    const date = e.target.value;
    setDeliveryDate(date);
    validateDeliveryDate(date);
  };

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate('/');
      return;
    }

    // Create payment intent
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating payment intent for amount:', totalAmount);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          metadata: {
            itemCount: getTotalItems(),
            orderDate: new Date().toISOString()
          }
        })
      });

      const data = await response.json();
      console.log('Payment intent response:', data);

      if (data.success) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        console.log('Payment intent created successfully');
      } else {
        console.error('Payment intent creation failed:', data.error);
        setError(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to connect to payment service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const isCustomerInfoValid = () => {
    return customerInfo.parentName &&
           customerInfo.parentEmail &&
           customerInfo.phone &&
           customerInfo.parentEmail.includes('@') &&
           deliveryDate &&
           !dateError;
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Initializing secure payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="error-message">
            <h2>Payment Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Return to Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {/* Order Summary */}
        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="cart-items-summary">
            {cart.map((item) => (
              <div key={item.cartId} className="checkout-item">
                <div className="item-details">
                  <h3>{item.menuItem.name}</h3>
                  <p className="item-meta">
                    Student: {item.studentName} | Room: {item.roomNumber}
                  </p>
                  <p className="item-meta">
                    School: {item.school} | Rice: {item.riceType}
                  </p>
                  {item.notes && <p className="item-notes">Notes: {item.notes}</p>}
                </div>
                <div className="item-price">
                  <span className="quantity">Qty: {item.quantity}</span>
                  <span className="price">${item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="total-section">
            <h3>Total: ${totalAmount.toFixed(2)} NZD</h3>
            <p className="item-count">{getTotalItems()} item(s)</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="customer-info-section">
          <h2>Parent/Guardian Information</h2>
          <div className="form-group">
            <label htmlFor="parentName">Full Name *</label>
            <input
              type="text"
              id="parentName"
              name="parentName"
              value={customerInfo.parentName}
              onChange={handleCustomerInfoChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="parentEmail">Email Address *</label>
            <input
              type="email"
              id="parentEmail"
              name="parentEmail"
              value={customerInfo.parentEmail}
              onChange={handleCustomerInfoChange}
              required
              placeholder="your.email@example.com"
            />
            <small>Order confirmation will be sent to this email</small>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              required
              placeholder="021 234 5678"
            />
          </div>
        </div>

        {/* Delivery Date Section */}
        <div className="customer-info-section">
          <h2>Delivery Information</h2>
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date *</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="deliveryDate"
                ref={(input) => {
                  if (input) {
                    input.addEventListener('click', (e) => {
                      e.preventDefault();
                      if (input.showPicker) {
                        try {
                          input.showPicker();
                        } catch (err) {
                          input.focus();
                        }
                      }
                    });
                  }
                }}
                value={deliveryDate}
                onChange={handleDeliveryDateChange}
                min={getMinDeliveryDate()}
                required
                className={dateError ? 'input-error' : ''}
              />
              <button
                type="button"
                className="date-picker-btn"
                onClick={() => {
                  const input = document.getElementById('deliveryDate');
                  if (input && input.showPicker) {
                    try {
                      input.showPicker();
                    } catch (err) {
                      input.focus();
                      input.click();
                    }
                  } else if (input) {
                    input.focus();
                    input.click();
                  }
                }}
              >
                📅 Select Date
              </button>
            </div>
            {dateError && (
              <span className="error-message" style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {dateError}
              </span>
            )}
            <small>Orders placed after 9:00 AM will be delivered the next day or later</small>
          </div>
        </div>

        {/* Payment Section */}
        {clientSecret && isCustomerInfoValid() && (
          <div className="payment-section">
            <h2>Payment Details</h2>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe'
                }
              }}
            >
              <CheckoutForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                customerInfo={customerInfo}
                totalAmount={totalAmount}
                deliveryDate={deliveryDate}
              />
            </Elements>
          </div>
        )}

        {clientSecret && !isCustomerInfoValid() && (
          <div className="info-required-message">
            <p>⚠️ Please complete all required fields above to see payment options.</p>
          </div>
        )}

        {!isCustomerInfoValid() && (
          <div className="info-required-message">
            <p>Please fill in all customer information fields to continue with payment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;