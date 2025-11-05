import React from 'react';
import { useCart } from '../hooks/useCart';
import './CartIcon.css';

function CartIcon() {
  const { cart, toggleCart } = useCart();
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <button className="cart-icon-button" onClick={toggleCart}>
      <span className="cart-icon">🛒</span>
      {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
    </button>
  );
}

export default CartIcon;