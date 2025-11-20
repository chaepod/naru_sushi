import React from 'react';
import { useCart } from '../hooks/useCart';
import { formatPrice, calculateCartTotals } from '../utils/cartHelpers';
import './Cart.css';

function Cart() {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  const { formatted, itemCount } = calculateCartTotals(cart);

  if (!isCartOpen) return null;

  const handleQuantityChange = (cartId, currentQty, delta) => {
    updateQuantity(cartId, currentQty + delta);
  };

  return (
    <>
      <div className="cart-overlay" onClick={toggleCart} />
      <div className="cart-sidebar">
        <div className="cart-header">
          <h2>Shopping Cart ({itemCount})</h2>
          <button className="cart-close-btn" onClick={toggleCart}>×</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <button onClick={toggleCart} className="continue-shopping-btn">
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="cart-item">
                <img
                  src={item.menuItem.image_url || '/images/placeholder.jpg'}
                  alt={item.menuItem.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.menuItem.name}</h3>

                  {/* Order Summary Box */}
                  <div className="cart-item-summary">
                    <div className="summary-row">
                      <span className="summary-label">For:</span>
                      <span className="summary-value">{item.studentName}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Room:</span>
                      <span className="summary-value">{item.roomNumber}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">School:</span>
                      <span className="summary-value">{item.school}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Delivery Date:</span>
                      <span className="summary-value">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Rice Type:</span>
                      <span className="summary-value">{item.riceType || 'White Rice'}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="cart-item-notes-box">
                      <span className="summary-label">📝 Notes:</span>
                      <span className="summary-value">{item.notes}</span>
                    </div>
                  )}

                  <div className="cart-item-footer">
                    <div className="cart-item-quantity">
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.cartId, item.quantity, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="cart-item-price">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.cartId)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal:</span>
              <span className="cart-total-price">{formatted}</span>
            </div>
            <button
              className="checkout-btn"
              onClick={() => alert('Checkout coming in Week 4!')}
            >
              Proceed to Checkout
            </button>
            <button
              className="clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Cart;