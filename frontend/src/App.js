import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MenuPage from './components/MenuPage';
import AboutPage from './components/AboutPage';
import OrderList from './components/OrderList';
import Cart from './components/Cart';
import { CartProvider } from './hooks/useCart';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<OrderList />} />
            </Routes>
          </main>
          <Cart />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;