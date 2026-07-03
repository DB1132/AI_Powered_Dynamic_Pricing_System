import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, Sliders, Info } from 'lucide-react';
import AdminDashboard from './pages/AdminDashboard';
import CustomerStore from './pages/CustomerStore';
import ProductDetails from './pages/ProductDetails';

export default function App() {
  const [currentView, setCurrentView] = useState('admin');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Notification handler
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync state with URL hash/path for routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/product/')) {
        const id = hash.split('/').pop();
        setSelectedProductId(parseInt(id));
        setCurrentView('product');
      } else if (hash === '#/customer') {
        setCurrentView('customer');
      } else {
        setCurrentView('admin');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigate = (view, id = null) => {
    if (view === 'product') {
      window.location.hash = `#/product/${id}`;
    } else if (view === 'customer') {
      window.location.hash = `#/customer`;
    } else {
      window.location.hash = `#/admin`;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <TrendingUp size={24} />
          <span>Antigravity Price AI</span>
        </div>
        <nav>
          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => navigate('admin')}
                className={`sidebar-link w-full text-left ${currentView === 'admin' ? 'active' : ''}`}
              >
                <Sliders size={18} />
                <span>Admin Dashboard</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('customer')}
                className={`sidebar-link w-full text-left ${currentView === 'customer' ? 'active' : ''}`}
              >
                <ShoppingBag size={18} />
                <span>Customer Store</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'admin' && <AdminDashboard navigate={navigate} showToast={showToast} />}
        {currentView === 'customer' && <CustomerStore showToast={showToast} />}
        {currentView === 'product' && (
          <ProductDetails 
            productId={selectedProductId} 
            onBack={() => navigate('admin')} 
            showToast={showToast}
          />
        )}
      </main>

      {/* Toast Alert stack */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Info size={18} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
