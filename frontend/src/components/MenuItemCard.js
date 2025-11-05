import React from 'react';
import './MenuItemCard.css';

function MenuItemCard({ item, onAddClick }) {
  return (
    <div className="menu-item-card">
      <div className="menu-item-image">
        <img 
          src={item.image_url || '/images/placeholder.jpg'} 
          alt={item.name}
          onError={(e) => e.target.src = '/images/placeholder.jpg'}
        />
      </div>
      <div className="menu-item-content">
        <h3 className="menu-item-name">{item.name}</h3>
        <p className="menu-item-description">{item.description}</p>
        <div className="menu-item-footer">
          <span className="menu-item-price">${item.price.toFixed(2)}</span>
          <button 
            className="menu-item-add-btn"
            onClick={() => onAddClick(item)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuItemCard;