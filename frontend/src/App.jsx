import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, ShoppingBag, DollarSign, Users, Search, Plus, X, 
  Sparkles, Star, RefreshCw, Sliders, ArrowLeft, ShoppingCart, Info, Award
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import confetti from 'canvas-confetti';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE = "http://localhost:8081";

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

/* ==========================================================================
   ADMIN DASHBOARD COMPONENT
   ========================================================================== */
function AdminDashboard({ navigate, showToast }) {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New product form states
  const [newProduct, setNewProduct] = useState({
    productName: '',
    currentPrice: '',
    competitorPrice: '',
    discount: '',
    inventoryLevel: '',
    category: 'Electronics',
    region: 'Store_1',
    promotion: false,
    epidemic: false
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      showToast("Failed to connect to Spring Boot backend.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          currentPrice: parseFloat(newProduct.currentPrice),
          competitorPrice: parseFloat(newProduct.competitorPrice),
          discount: parseInt(newProduct.discount) || 0,
          inventoryLevel: parseInt(newProduct.inventoryLevel) || 0,
        })
      });
      if (res.ok) {
        showToast("Product created successfully!");
        setIsAddModalOpen(false);
        setNewProduct({
          productName: '',
          currentPrice: '',
          competitorPrice: '',
          discount: '',
          inventoryLevel: '',
          category: 'Electronics',
          region: 'Store_1',
          promotion: false,
          epidemic: false
        });
        fetchProducts();
      } else {
        showToast("Error creating product.", "error");
      }
    } catch (err) {
      showToast("Failed to contact server.", "error");
    }
  };

  // KPI Calculations
  const totalProducts = products.length;
  const avgPrice = products.length > 0 
    ? Math.round(products.reduce((acc, p) => acc + p.currentPrice, 0) / products.length)
    : 0;
  const totalStock = products.reduce((acc, p) => acc + p.inventoryLevel, 0);
  const activePromos = products.filter(p => p.promotion).length;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dynamic Pricing Control</h1>
          <p className="dashboard-subtitle">Monitor demand projections, reviews summaries, and optimize pricing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--color-primary)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="kpi-label">TOTAL PRODUCTS</div>
            <div className="kpi-value">{totalProducts}</div>
          </div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--color-secondary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="kpi-label">AVG CURRENT PRICE</div>
            <div className="kpi-value">₹{avgPrice}</div>
          </div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--color-success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="kpi-label">TOTAL INVENTORY</div>
            <div className="kpi-value">{totalStock} units</div>
          </div>
        </div>
        <div className="kpi-card glass">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--color-warning)' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <div className="kpi-label">ACTIVE PROMOTIONS</div>
            <div className="kpi-value">{activePromos}</div>
          </div>
        </div>
      </div>

      {/* Product List Grid */}
      {loading ? (
        <div className="text-center py-20 text-muted">Loading products...</div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <div key={p.id} className="product-card glass">
              <div>
                <span className="product-category">{p.category}</span>
                <h3 className="product-name">{p.productName}</h3>
                <p className="kpi-label" style={{ marginBottom: '16px' }}>
                  Stock: <span style={{ color: p.inventoryLevel < 30 ? 'var(--color-danger)' : 'var(--text-main)', fontWeight: 'bold' }}>{p.inventoryLevel}</span> units
                </p>
              </div>
              <div className="product-details">
                <div>
                  <div className="product-price-label">Price</div>
                  <div className="product-price">₹{p.currentPrice}</div>
                </div>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('product', p.id)}
                >
                  Configure AI
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal Overlay */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2 className="modal-title">New Product specs</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-control" 
                  value={newProduct.productName}
                  onChange={e => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control"
                    value={newProduct.currentPrice}
                    onChange={e => setNewProduct(prev => ({ ...prev, currentPrice: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Competitor Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control"
                    value={newProduct.competitorPrice}
                    onChange={e => setNewProduct(prev => ({ ...prev, competitorPrice: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={newProduct.discount}
                    onChange={e => setNewProduct(prev => ({ ...prev, discount: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory level</label>
                  <input 
                    type="number" 
                    required 
                    className="form-control"
                    value={newProduct.inventoryLevel}
                    onChange={e => setNewProduct(prev => ({ ...prev, inventoryLevel: e.target.value }))}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control"
                    value={newProduct.category}
                    onChange={e => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option>Electronics</option>
                    <option>Apparel</option>
                    <option>Footwear</option>
                    <option>Home Appliances</option>
                    <option>Accessories</option>
                    <option>Fitness</option>
                    <option>Personal Care</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Store region</label>
                  <select 
                    className="form-control"
                    value={newProduct.region}
                    onChange={e => setNewProduct(prev => ({ ...prev, region: e.target.value }))}
                  >
                    <option>Store_1</option>
                    <option>Store_2</option>
                    <option>Store_3</option>
                    <option>Store_4</option>
                    <option>Store_5</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '24px', margin: '20px 0' }}>
                <label className="checkbox-group">
                  <input 
                    type="checkbox" 
                    checked={newProduct.promotion}
                    onChange={e => setNewProduct(prev => ({ ...prev, promotion: e.target.checked }))}
                  />
                  <span>Active Promotion</span>
                </label>
                <label className="checkbox-group">
                  <input 
                    type="checkbox" 
                    checked={newProduct.epidemic}
                    onChange={e => setNewProduct(prev => ({ ...prev, epidemic: e.target.checked }))}
                  />
                  <span>Epidemic Condition</span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary w-full">Create Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   CUSTOMER STOREFRONT COMPONENT
   ========================================================================== */
function CustomerStore({ showToast }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [historyMap, setHistoryMap] = useState({});

  const fetchStoreProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      setProducts(data);

      const hMap = {};
      await Promise.all(data.map(async (p) => {
        try {
          const hRes = await fetch(`${API_BASE}/pricing/history/${p.id}`);
          const hData = await hRes.json();
          if (hData && hData.length > 0) {
            hMap[p.id] = hData[hData.length - 1];
          }
        } catch (err) {
          // ignore
        }
      }));
      setHistoryMap(hMap);
    } catch (e) {
      showToast("Error loading shop catalog.", "error");
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const handleBuy = async (productId, name) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/buy`, {
        method: 'POST'
      });
      if (res.ok) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.8 }
        });
        showToast(`Thank you! Purchased 1 unit of ${name}.`);
        fetchStoreProducts();
      } else {
        showToast("Error placing purchase.", "error");
      }
    } catch (e) {
      showToast("Purchase connection failed.", "error");
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Electronics & Retail Store</h1>
          <p className="dashboard-subtitle">Enjoy dynamically adjusted pricing based on market trends and stock scarcity.</p>
        </div>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search items by name..." 
            className="form-control search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`btn btn-secondary ${activeCategory === cat ? 'active' : ''}`}
            style={{ 
              borderRadius: '20px', 
              padding: '6px 16px',
              border: activeCategory === cat ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
              background: activeCategory === cat ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.map(p => {
          const latestHistory = historyMap[p.id];
          const hasOptimizedPrice = latestHistory && latestHistory.newPrice < p.currentPrice;
          const displayPrice = hasOptimizedPrice ? latestHistory.newPrice : p.currentPrice;
          const discountPercent = hasOptimizedPrice 
            ? Math.round(100 * (p.currentPrice - latestHistory.newPrice) / p.currentPrice)
            : p.discount;

          return (
            <div key={p.id} className="product-card glass">
              <div>
                <span className="product-category">{p.category}</span>
                <h3 className="product-name">{p.productName}</h3>
                
                <div style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                  {p.inventoryLevel < 30 ? (
                    <span className="badge badge-scarcity">🔥 Low Stock</span>
                  ) : (
                    <span className="badge badge-discount" style={{ color: 'var(--color-secondary)' }}>In Stock</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="badge badge-discount">-{discountPercent}% OFF</span>
                  )}
                </div>
              </div>

              <div className="product-details">
                <div>
                  <div className="product-price-label">Retail Price</div>
                  {hasOptimizedPrice ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span className="original-price" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '14px' }}>₹{Math.round(p.currentPrice)}</span>
                      <span className="product-price">₹{Math.round(displayPrice)}</span>
                    </div>
                  ) : (
                    <div className="product-price">₹{Math.round(p.currentPrice)}</div>
                  )}
                </div>
                <button 
                  className="btn btn-primary"
                  disabled={p.inventoryLevel <= 0}
                  onClick={() => handleBuy(p.id, p.productName)}
                  style={{ opacity: p.inventoryLevel <= 0 ? 0.5 : 1 }}
                >
                  <ShoppingCart size={16} />
                  <span>{p.inventoryLevel <= 0 ? 'Out of Stock' : 'Buy Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   PRODUCT OPTIMIZATION DETAIL PAGE COMPONENT
   ========================================================================== */
function ProductDetails({ productId, onBack, showToast }) {
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [reviews, setReviews] = useState([]);
  
  // ML Optimization outputs
  const [optData, setOptData] = useState(null);
  const [loadingOpt, setLoadingOpt] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Editable parameters sandbox states
  const [params, setParams] = useState({
    price: 0,
    competitorPrice: 0,
    discount: 0,
    inventoryLevel: 0,
    promotion: false,
    epidemic: false
  });

  const loadData = async () => {
    try {
      // 1. Fetch product
      const res = await fetch(`${API_BASE}/products/${productId}`);
      const p = await res.json();
      setProduct(p);
      setParams({
        price: p.currentPrice,
        competitorPrice: p.competitorPrice,
        discount: p.discount,
        inventoryLevel: p.inventoryLevel,
        promotion: p.promotion,
        epidemic: p.epidemic
      });

      // 2. Fetch history
      const histRes = await fetch(`${API_BASE}/pricing/history/${productId}`);
      const hist = await histRes.json();
      setHistory(hist);

      // 3. Fetch reviews
      const revRes = await fetch(`${API_BASE}/reviews/${productId}`);
      const rev = await revRes.json();
      setReviews(rev);

    } catch (e) {
      showToast("Error loading product detail fields.", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  // Saves modified slider details to Spring Boot DB
  const saveParameters = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          currentPrice: parseFloat(params.price),
          competitorPrice: parseFloat(params.competitorPrice),
          discount: parseInt(params.discount),
          inventoryLevel: parseInt(params.inventoryLevel),
          promotion: params.promotion,
          epidemic: params.epidemic
        })
      });
      if (res.ok) {
        showToast("Parameters saved to Database!");
        loadData(); // reload
      } else {
        showToast("Failed to save changes.", "error");
      }
    } catch (e) {
      showToast("Save connection failed.", "error");
    }
  };

  // Runs ML Model Optimization API via backend
  const runOptimization = async () => {
    try {
      setLoadingOpt(true);
      const res = await fetch(`${API_BASE}/pricing/optimize/${productId}`, {
        method: 'POST'
      });
      const data = await res.json();
      setOptData(data);
      showToast("Pricing optimized by AI engine!");
      // Reload history & product details (since it saves a history point)
      loadData();
    } catch (e) {
      showToast("Optimization engine timeout or error.", "error");
    } finally {
      setLoadingOpt(false);
    }
  };

  // Summarize Reviews using Gemini API
  const fetchAISummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await fetch(`${API_BASE}/ai/description/${productId}`, {
        method: 'POST'
      });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch (e) {
      showToast("Gemini API call failed.", "error");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!product) return <div className="text-center py-20 text-muted">Loading product details...</div>;

  // Chart configuration: Price History
  const historyPrices = history.map(x => x.newPrice);
  const historyDates = history.map(x => new Date(x.updatedAt).toLocaleTimeString());

  const priceHistoryChartData = {
    labels: historyDates,
    datasets: [{
      label: "Optimal Price Log",
      data: historyPrices,
      borderColor: "#6366F1",
      backgroundColor: "rgba(99, 102, 241, 0.15)",
      borderWidth: 2.5,
      tension: 0.3,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#6366F1",
    }]
  };

  // Chart configuration: Revenue Curve
  let revenueCurveChartData = null;
  if (optData) {
    const maxRev = Math.max(...optData.revenues);
    const optimalPriceIndex = optData.revenues.indexOf(maxRev);
    const optimalPrice = optData.tested_prices[optimalPriceIndex];

    revenueCurveChartData = {
      labels: optData.tested_prices.map(p => Math.round(p)),
      datasets: [
        {
          label: "Predicted Revenue",
          data: optData.tested_prices.map((p, i) => ({ x: p, y: optData.revenues[i] })),
          borderColor: "#10B981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Optimal Price Peak',
          data: [{ x: optimalPrice, y: maxRev }],
          pointRadius: 8,
          pointBackgroundColor: "#EF4444",
          borderColor: "#FFF",
          borderWidth: 2,
          showLine: false
        }
      ]
    };
  }

  const avgReviewRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "No ratings";

  return (
    <div>
      {/* Detail Dashboard Header */}
      <div className="dashboard-header" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-12">
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ marginLeft: '12px' }}>
            <h1 className="dashboard-title">{product.productName}</h1>
            <span className="product-category" style={{ margin: '8px 0 0' }}>{product.category}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={fetchAISummary}
            disabled={loadingSummary}
          >
            {loadingSummary ? 'Parsing...' : 'Generate AI Reviews Summary'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={runOptimization}
            disabled={loadingOpt}
          >
            <RefreshCw className={loadingOpt ? 'animate-spin' : ''} size={18} />
            <span>{loadingOpt ? 'Optimizing...' : 'Calculate Optimal Price'}</span>
          </button>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left Side: Parameters Form, Reviews, AI summarization */}
        <div>
          {/* Sandbox parameter editor */}
          <div className="detail-card glass" style={{ marginBottom: '24px' }}>
            <h2 className="modal-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={20} style={{ color: 'var(--color-primary)' }} />
              <span>Simulation Sandbox</span>
            </h2>
            
            <div className="slider-container">
              <div className="slider-header">
                <span className="form-label">Current Base Price</span>
                <span className="product-price" style={{ fontSize: '16px' }}>₹{params.price}</span>
              </div>
              <input 
                type="range" 
                min={Math.round(product.currentPrice * 0.4)} 
                max={Math.round(product.currentPrice * 2.0)} 
                className="slider-control"
                value={params.price}
                onChange={e => setParams(prev => ({ ...prev, price: parseInt(e.target.value) }))}
              />
            </div>

            <div className="slider-container">
              <div className="slider-header">
                <span className="form-label">Competitor Price</span>
                <span className="product-price" style={{ fontSize: '16px' }}>₹{params.competitorPrice}</span>
              </div>
              <input 
                type="range" 
                min={Math.round(product.competitorPrice * 0.4)} 
                max={Math.round(product.competitorPrice * 2.0)} 
                className="slider-control"
                value={params.competitorPrice}
                onChange={e => setParams(prev => ({ ...prev, competitorPrice: parseInt(e.target.value) }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Active Discount (%)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={params.discount}
                  onChange={e => setParams(prev => ({ ...prev, discount: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock level (units)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={params.inventoryLevel}
                  onChange={e => setParams(prev => ({ ...prev, inventoryLevel: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', margin: '16px 0 24px' }}>
              <label className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={params.promotion}
                  onChange={e => setParams(prev => ({ ...prev, promotion: e.target.checked }))}
                />
                <span>Active Promo</span>
              </label>
              <label className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={params.epidemic}
                  onChange={e => setParams(prev => ({ ...prev, epidemic: e.target.checked }))}
                />
                <span>Epidemic Lockdown</span>
              </label>
            </div>

            <button className="btn btn-secondary w-full" onClick={saveParameters}>
              Save Sandbox parameters to DB
            </button>
          </div>

          {/* AI Reviews Summary */}
          {aiSummary && (
            <div className="ai-summary-box" style={{ marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                <span>AI Sentiment analysis</span>
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>{aiSummary}</p>
            </div>
          )}

          {/* Customer Reviews card */}
          <div className="detail-card glass">
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h3 className="modal-title" style={{ fontSize: '18px' }}>Product Reviews</h3>
              <span className="badge badge-discount" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} fill="currentColor" />
                <span>Rating: {avgReviewRating}</span>
              </span>
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.reviewerName}</span>
                    <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px' }}>
                      <Star size={12} fill="currentColor" /> {r.rating}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{r.reviewText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Price optimization outputs & Dynamic Charts */}
        <div>
          {optData && (
            <div className="detail-card glass" style={{ marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.03)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', marginBottom: '16px' }}>
                <Award size={20} />
                <span>Optimized Results Summary</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <div className="product-price-label">Optimal Price</div>
                  <div className="product-price" style={{ color: 'var(--color-success)', fontSize: '26px' }}>₹{Math.round(optData.optimal_price)}</div>
                </div>
                <div>
                  <div className="product-price-label">Expected Demand</div>
                  <div className="product-price" style={{ fontSize: '26px' }}>{Math.round(optData.expected_demand)} u</div>
                </div>
                <div>
                  <div className="product-price-label">Expected Revenue</div>
                  <div className="product-price" style={{ fontSize: '26px', color: 'var(--color-secondary)' }}>₹{Math.round(optData.expected_revenue)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Price History Chart */}
          {history.length > 0 && (
            <div className="chart-card glass">
              <h3 className="form-label" style={{ marginBottom: '16px' }}>Optimization Price History Log</h3>
              <div style={{ height: '220px' }}>
                <Line 
                  data={priceHistoryChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
                      y: { ticks: { color: '#9CA3AF' } }
                    }
                  }} 
                />
              </div>
            </div>
          )}

          {/* Revenue Curve Chart */}
          {revenueCurveChartData && (
            <div className="chart-card glass">
              <h3 className="form-label" style={{ marginBottom: '16px' }}>Simulated Revenue Curve (Optimal Peak)</h3>
              <div style={{ height: '220px' }}>
                <Line 
                  data={revenueCurveChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { 
                        type: 'linear',
                        grid: { display: false }, 
                        ticks: { color: '#9CA3AF' },
                        title: { display: true, text: 'Simulated Prices (₹)', color: '#9CA3AF' }
                      },
                      y: { 
                        ticks: { color: '#9CA3AF' },
                        title: { display: true, text: 'Expected Revenue (₹)', color: '#9CA3AF' }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
