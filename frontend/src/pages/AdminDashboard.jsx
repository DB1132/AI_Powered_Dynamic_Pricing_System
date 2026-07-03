import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

const API_BASE = "http://localhost:8081";

export default function AdminDashboard({ navigate, showToast }) {
  const [products, setProducts] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <div className="modal-header">
              <h2 className="modal-title">New Product specs</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
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
