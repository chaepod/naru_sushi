// Generate a unique ID for each cart item
export function generateCartId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

// Format numbers as currency
export function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

// Calculate cart totals
export function calculateCartTotals(cart) {
  const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  return {
    subtotal,
    itemCount,
    formatted: formatPrice(subtotal)
  };
}