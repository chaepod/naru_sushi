// src/components/OrderList.js
import React, { useState, useEffect } from 'react';
import './OrderList.css';

// Add this line at the top
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('All Schools');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'production'

  const formatDate = (dateValue, includeTime = false) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';

      const options = includeTime
        ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

      return date.toLocaleDateString('en-NZ', options);
    } catch (e) {
      return 'N/A';
    }
  };

  const formatDateDDMMYYYY = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return 'N/A';

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (e) {
      return 'N/A';
    }
  };

  const filterOrdersByDateAndSchool = () => {
    if (!orders || orders.length === 0) {
      setFilteredOrders([]);
      return;
    }

    const selectedDateStr = formatDateDDMMYYYY(selectedDate);

    const filtered = orders.filter(order => {
      // Filter by date
      const orderDate = order.deliveryDate || order.date;
      if (!orderDate) return false;

      const orderDateStr = formatDateDDMMYYYY(orderDate);
      const dateMatches = orderDateStr === selectedDateStr;

      // Filter by school
      const schoolMatches = selectedSchool === 'All Schools' || order.school === selectedSchool;

      return dateMatches && schoolMatches;
    });

    setFilteredOrders(filtered);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch orders, menu items, and schools
      const [ordersRes, menuRes, schoolsRes] = await Promise.all([
        fetch(`${API_URL}/api/orders`),
        fetch(`${API_URL}/api/menu`),
        fetch(`${API_URL}/api/schools`)
      ]);

      if (!ordersRes.ok || !menuRes.ok || !schoolsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();
      const schoolsData = await schoolsRes.json();

      setOrders(ordersData.data);
      setMenuItems(menuData.data);
      setSchools(schoolsData.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterOrdersByDateAndSchool();
  }, [orders, selectedDate, selectedSchool]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCustomCalendar && !event.target.closest('.date-input-container')) {
        setShowCustomCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomCalendar]);

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handlePrint = () => {
    window.print();
  };

  // Get unique dates that have orders (filtered by selected school)
  const getDatesWithOrders = () => {
    const datesSet = new Set();
    orders.forEach(order => {
      // Filter by school
      const schoolMatches = selectedSchool === 'All Schools' || order.school === selectedSchool;

      if (schoolMatches) {
        const orderDate = order.deliveryDate || order.date;
        if (orderDate) {
          const dateStr = formatDateDDMMYYYY(orderDate);
          datesSet.add(dateStr);
        }
      }
    });
    return datesSet;
  };

  const datesWithOrders = getDatesWithOrders();

  // Generate calendar grid for current month
  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = new Array(7).fill(null);

    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
      const currentDate = new Date(year, month, day);

      currentWeek[dayOfWeek] = {
        date: currentDate,
        day: day,
        hasOrders: datesWithOrders.has(formatDateDDMMYYYY(currentDate)),
        isToday: isToday(currentDate),
        isSelected: formatDateDDMMYYYY(currentDate) === formatDateDDMMYYYY(selectedDate)
      };

      if (dayOfWeek === 6 || day === daysInMonth) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
    }

    return weeks;
  };

  const calendarWeeks = generateCalendar(currentCalendarMonth);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCustomCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCustomCalendar(!showCustomCalendar);
    if (!showCustomCalendar) {
      setCurrentCalendarMonth(selectedDate);
    }
  };

  const getProductionList = () => {
    const productionMap = {};

    // Use all orders (not filtered) for production list
    const ordersToProcess = orders.filter(order => {
      // Only filter by school, not by date
      const schoolMatches = selectedSchool === 'All Schools' || order.school === selectedSchool;
      return schoolMatches;
    });

    ordersToProcess.forEach(order => {
      order.items.forEach(item => {
        const menuItem = menuItems.find(m => m.name === item.name);
        const category = menuItem?.category || 'Other';

        // Create a unique key with rice type and notes
        const riceType = item.riceType || '';
        const notes = item.specialNotes || '';
        const itemKey = `${item.name}|${riceType}|${notes}`;

        if (!productionMap[category]) {
          productionMap[category] = {};
        }

        if (!productionMap[category][itemKey]) {
          productionMap[category][itemKey] = {
            name: item.name,
            quantity: 0,
            riceType,
            notes
          };
        }

        productionMap[category][itemKey].quantity += item.quantity;
      });
    });

    return productionMap;
  };

  const productionList = getProductionList();

  // Format date for input value (YYYY-MM-DD)
  const getDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="order-list-container">
      <div className="orders-header">
        <div className="header-left">
          <h1>Order Management</h1>
          <p className="orders-count">Total Orders: {orders.length}</p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'production' ? 'active' : ''}`}
            onClick={() => setViewMode('production')}
          >
            All Orders
          </button>
          <button
            className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Schools
          </button>
          <button
            className={`toggle-btn ${viewMode === 'labels' ? 'active' : ''}`}
            onClick={() => setViewMode('labels')}
          >
            Student Labels
          </button>
        </div>
      </div>

      <div className="date-filter-container">
        <div className="filters-wrapper">
          <div className="date-filter-section">
            <label htmlFor="date-filter" className="date-filter-label">
              Filter by Delivery Date:
            </label>
            <div className="date-filter-input-wrapper">
            <div className="date-input-container">
              <input
                type="text"
                id="date-display"
                className="date-filter-input"
                value={formatDateDDMMYYYY(selectedDate)}
                readOnly
                onClick={toggleCalendar}
              />
              <button
                type="button"
                className="calendar-btn"
                onClick={toggleCalendar}
                aria-label="Open calendar"
              >
                📅
              </button>

              {showCustomCalendar && (
                <div className="custom-calendar-dropdown">
                  <div className="calendar-header">
                    <button className="calendar-nav-btn" onClick={handlePrevMonth}>‹</button>
                    <span className="calendar-month-year">
                      {currentCalendarMonth.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })}
                    </span>
                    <button className="calendar-nav-btn" onClick={handleNextMonth}>›</button>
                  </div>

                  <button
                    onClick={() => {
                      handleTodayClick();
                      setShowCustomCalendar(false);
                    }}
                    className="today-btn-calendar"
                    disabled={isToday(selectedDate)}
                  >
                    Today
                  </button>

                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      <div className="calendar-weekday">Sun</div>
                      <div className="calendar-weekday">Mon</div>
                      <div className="calendar-weekday">Tue</div>
                      <div className="calendar-weekday">Wed</div>
                      <div className="calendar-weekday">Thu</div>
                      <div className="calendar-weekday">Fri</div>
                      <div className="calendar-weekday">Sat</div>
                    </div>

                    <div className="calendar-days">
                      {calendarWeeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="calendar-week">
                          {week.map((dayInfo, dayIndex) => (
                            <div
                              key={dayIndex}
                              className={`calendar-day ${!dayInfo ? 'empty' : ''} ${dayInfo?.isToday ? 'today' : ''} ${dayInfo?.isSelected ? 'selected' : ''} ${dayInfo?.hasOrders ? 'has-orders' : ''}`}
                              onClick={() => dayInfo && handleDateSelect(dayInfo.date)}
                            >
                              {dayInfo && (
                                <span className="day-number">{dayInfo.day}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
              </div>
            </div>

            <div className="school-filter-section">
              <label htmlFor="school-filter" className="school-filter-label">
                Filter by School:
              </label>
              <select
                id="school-filter"
                className="school-filter-select"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="All Schools">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.name}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="filtered-count">
            Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} for {selectedSchool === 'All Schools' ? 'all schools' : selectedSchool}
          </p>
        </div>

      {/* Production List - Only visible when printing */}
      <div className="production-list-print">
        {Object.keys(productionList).sort().map(category => (
          <div key={category} className="production-category">
            <h3 className="production-category-title">{category}</h3>
            <table className="production-table">
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Item</th>
                  <th>Rice Type</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(productionList[category])
                  .sort((a, b) => b.quantity - a.quantity)
                  .map((item, index) => (
                    <tr key={index}>
                      <td className="quantity-cell">{item.quantity}</td>
                      <td className="item-name-cell">{item.name}</td>
                      <td className="rice-cell">{item.riceType || '-'}</td>
                      <td className="notes-cell">{item.notes || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <button onClick={handlePrint} className="print-btn" title="Print Orders">
        🖨️
      </button>

      {viewMode === 'production' ? (
        <div className="production-list-view">
          {Object.keys(productionList).length > 0 ? (
            <>
              <div className="production-date-header">
                Delivery Date: {formatDateDDMMYYYY(selectedDate)}
              </div>
              {Object.keys(productionList).sort().map(category => (
                <div key={category} className="production-category-section">
                  <h3 className="production-category-header">{category}</h3>
                  <table className="production-view-table">
                    <thead>
                      <tr>
                        <th>Quantity</th>
                        <th>Item</th>
                        <th>Rice Type</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(productionList[category])
                        .sort((a, b) => b.quantity - a.quantity)
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="quantity-cell">{item.quantity}</td>
                            <td className="item-name-cell">{item.name}</td>
                            <td className="rice-cell">{item.riceType || '-'}</td>
                            <td className="notes-cell">{item.notes || '-'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </>
          ) : (
            <p className="no-orders-message">No orders found for the selected date and school.</p>
          )}
        </div>
      ) : viewMode === 'labels' ? (
        <div className="labels-list-view">
          {filteredOrders.length > 0 ? (
            (() => {
              // Group orders by school
              const ordersBySchool = {};
              filteredOrders.forEach(order => {
                const school = order.school || 'Unknown School';
                if (!ordersBySchool[school]) {
                  ordersBySchool[school] = [];
                }
                ordersBySchool[school].push(order);
              });

              return Object.keys(ordersBySchool).sort().map(school => (
                <div key={school} className="labels-school-section">
                  <h3 className="labels-school-header">{school}</h3>
                  <div className="labels-grid">
                    {ordersBySchool[school].map(order => (
                      order.items.map((item, itemIndex) => (
                        <div key={`${order.id}-${itemIndex}`} className="student-label-card">
                          <div className="label-field">
                            <span className="label-title">Room:</span>
                            <span className="label-value">{order.room || 'N/A'}</span>
                          </div>
                          <div className="label-field">
                            <span className="label-title">Name:</span>
                            <span className="label-value">{order.studentName || 'N/A'}</span>
                          </div>
                          <div className="label-field">
                            <span className="label-title">School:</span>
                            <span className="label-value">{order.school || 'N/A'}</span>
                          </div>
                          <div className="label-field">
                            <span className="label-title">Delivery Date:</span>
                            <span className="label-value">{formatDateDDMMYYYY(order.deliveryDate || order.date)}</span>
                          </div>
                          <div className="label-field">
                            <span className="label-title">Item:</span>
                            <span className="label-value">{item.name}</span>
                          </div>
                          <div className="label-field">
                            <span className="label-title">Quantity:</span>
                            <span className="label-value">{item.quantity}</span>
                          </div>
                          {item.riceType && (
                            <div className="label-field">
                              <span className="label-title">Rice Type:</span>
                              <span className="label-value">{item.riceType}</span>
                            </div>
                          )}
                          {item.specialNotes && (
                            <div className="label-field">
                              <span className="label-title">Notes:</span>
                              <span className="label-value">{item.specialNotes}</span>
                            </div>
                          )}
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              ));
            })()
          ) : (
            <p className="no-orders-message">No orders found for the selected date and school.</p>
          )}
        </div>
      ) : (
        <div className="cards-list-view">
          {filteredOrders.length > 0 ? (
            (() => {
              // Group orders by school
              const ordersBySchool = {};
              filteredOrders.forEach(order => {
                const school = order.school || 'Unknown School';
                if (!ordersBySchool[school]) {
                  ordersBySchool[school] = [];
                }
                ordersBySchool[school].push(order);
              });

              return Object.keys(ordersBySchool).sort().map(school => (
                <div key={school} className="cards-school-section">
                  <h3 className="cards-school-header">{school}</h3>
                  <table className="cards-view-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Room</th>
                        <th>Delivery Date</th>
                        <th>Quantity</th>
                        <th>Item</th>
                        <th>Rice Type</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordersBySchool[school].map(order => (
                        order.items.map((item, itemIndex) => (
                          <tr key={`${order.id}-${itemIndex}`}>
                            <td className="student-name-cell">{order.studentName || 'N/A'}</td>
                            <td className="room-cell">{order.room || 'N/A'}</td>
                            <td className="date-cell">{formatDateDDMMYYYY(order.deliveryDate || order.date)}</td>
                            <td className="quantity-cell">{item.quantity}</td>
                            <td className="item-name-cell">{item.name}</td>
                            <td className="rice-cell">{item.riceType || '-'}</td>
                            <td className="notes-cell">{item.specialNotes || '-'}</td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              ));
            })()
          ) : (
            <p className="no-orders-message">No orders found for the selected date and school.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default OrderList;