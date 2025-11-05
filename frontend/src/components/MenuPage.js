import React, { useState, useEffect } from 'react';
import MenuItemCard from './MenuItemCard';
import OrderModal from './OrderModal';
import './MenuPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/menu`);
      if (!response.ok) throw new Error('Failed to fetch menu');
      const data = await response.json();
      setMenuItems(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="loading">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-container">
        <header className="menu-header">
          <h1>Our Menu</h1>
          <p>Fresh, delicious Japanese cuisine for school lunches</p>
        </header>
        <div className="menu-grid">
          {menuItems.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddClick={handleAddClick}
            />
          ))}
        </div>
      </div>
      {isModalOpen && (
        <OrderModal
          item={selectedItem}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default MenuPage;