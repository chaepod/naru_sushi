import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import './OrderModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [riceType, setRiceType] = useState('White Rice');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [school, setSchool] = useState('');
  const [studentName, setStudentName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [schools, setSchools] = useState([]);
  const [errors, setErrors] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchSchools();
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const fetchSchools = async () => {
    try {
      const response = await fetch(`${API_URL}/api/schools`);
      const data = await response.json();
      setSchools(data.data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!deliveryDate) newErrors.deliveryDate = 'Please select a delivery date';
    if (!school) newErrors.school = 'Please select a school';
    if (!studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!validateForm()) return;

    addToCart({
      menuItem: item,
      quantity,
      riceType,
      deliveryDate,
      school,
      studentName,
      roomNumber,
      notes,
      totalPrice: item.price * quantity
    });
    onClose();
  };

  const totalPrice = (item.price * quantity).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <img
            src={item.image_url || '/images/placeholder.jpg'}
            alt={item.name}
            loading="lazy"
            className="modal-item-image"
          />
          <div className="modal-item-info">
            <h2>{item.name}</h2>
            <p className="modal-item-description">{item.description}</p>
            <p className="modal-item-price">${item.price.toFixed(2)} each</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Quantity</label>
            <div className="quantity-selector">
              <button 
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                type="button"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="riceType">Rice Type</label>
            <select
              id="riceType"
              value={riceType}
              onChange={(e) => setRiceType(e.target.value)}
            >
              <option value="White Rice">White Rice</option>
              <option value="Brown Rice">Brown Rice</option>
              <option value="Sushi Rice">Sushi Rice</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date *</label>
            <input
              type="date"
              id="deliveryDate"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className={errors.deliveryDate ? 'input-error' : ''}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.deliveryDate && (
              <span className="error-message">{errors.deliveryDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="school">School *</label>
            <select
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={errors.school ? 'input-error' : ''}
            >
              <option value="">Select a school...</option>
              {schools.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.school && (
              <span className="error-message">{errors.school}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="studentName">Student's Full Name *</label>
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className={errors.studentName ? 'input-error' : ''}
              placeholder="Enter student's name"
            />
            {errors.studentName && (
              <span className="error-message">{errors.studentName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="roomNumber">Room Number *</label>
            <input
              type="text"
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className={errors.roomNumber ? 'input-error' : ''}
              placeholder="e.g., Room 5"
            />
            {errors.roomNumber && (
              <span className="error-message">{errors.roomNumber}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Special Instructions (Optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any allergies or special requests..."
              rows="3"
            />
          </div>

          <button 
            type="button"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart - ${totalPrice}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;