import React, { createContext, useContext, useState } from 'react';
import useLocalStorage from './useLocalStorage';
import { generateCartId } from '../utils/cartHelpers';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useLocalStorage('naruSushiCart', []);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (item) => {
    const cartItemWithId = {
      ...item,
      cartId: generateCartId(),
      addedAt: new Date().toISOString()
    };
    setCart(prevCart => [...prevCart, cartItemWithId]);
  };

  const removeFromCart = (cartId) => {
    setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartId === cartId
          ? { ...item, quantity: newQuantity, totalPrice: item.menuItem.price * newQuantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);
  const toggleCart = () => setIsCartOpen(prev => !prev);
  const getTotalPrice = () => cart.reduce((total, item) => total + item.totalPrice, 0);
  const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cart,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalPrice,
    getTotalItems
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}