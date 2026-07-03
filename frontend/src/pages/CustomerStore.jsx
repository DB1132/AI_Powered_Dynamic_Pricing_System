import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE = "http://localhost:8081";

export default function CustomerStore({ showToast }) {
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
