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

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Define category order
  const categoryOrder = ['On Rice', 'Maki', 'Nigiri', 'Sashimi', 'Platters', 'Other'];
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="menu-page">
      <div className="menu-container">
        <header className="menu-header">
          <h1>Our Menu</h1>
          <p>Fresh, delicious Japanese cuisine for school lunches</p>
          <p className="menu-disclaimer">Orders placed on the day are cut off by 9am each day.</p>
        </header>

        {sortedCategories.map(category => (
          <div key={category} className="menu-category">
            <h2 className="category-title">{category}</h2>
            <div className="menu-grid">
              {groupedItems[category].map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddClick={handleAddClick}
                />
              ))}
            </div>
          </div>
        ))}
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