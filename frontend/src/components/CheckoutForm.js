import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useCart } from '../hooks/useCart';
import './CheckoutForm.css';

const CheckoutForm = ({ clientSecret, paymentIntentId, customerInfo, totalAmount, deliveryDate }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: window.location.origin + '/order-confirmation',
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in database with delivery date added to each cart item
        const cartWithDeliveryDate = cart.map(item => ({
          ...item,
          deliveryDate: deliveryDate
        }));

        const orderResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cart: cartWithDeliveryDate,
            customerInfo: customerInfo,
            paymentIntentId: paymentIntentId,
            totalAmount: totalAmount,
            deliveryDate: deliveryDate
          })
        });

        const orderData = await orderResponse.json();

        if (orderData.success) {
          // Clear cart
          clearCart();
          
          // Redirect to confirmation page
          navigate(`/order-confirmation/${orderData.orderNumber}`, {
            state: { orderData: orderData }
          });
        } else {
          setError('Payment successful but order creation failed. Please contact support with reference: ' + paymentIntentId);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <PaymentElement />
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="submit-payment-btn"
      >
        {processing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)} NZD`}
      </button>

      <p className="secure-payment-note">
        🔒 Your payment information is securely processed by Stripe
      </p>
    </form>
  );
};

export default CheckoutForm;