import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Sliders, Sparkles, Star, Award } from 'lucide-react';
import { Line } from 'react-chartjs-2';
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

export default function ProductDetails({ productId, onBack, showToast }) {
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [reviews, setReviews] = useState([]);
  
  const [optData, setOptData] = useState(null);
  const [loadingOpt, setLoadingOpt] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

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

      const histRes = await fetch(`${API_BASE}/pricing/history/${productId}`);
      const hist = await histRes.json();
      setHistory(hist);

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
        loadData();
      } else {
        showToast("Failed to save changes.", "error");
      }
    } catch (e) {
      showToast("Save connection failed.", "error");
    }
  };

  const runOptimization = async () => {
    try {
      setLoadingOpt(true);
      const res = await fetch(`${API_BASE}/pricing/optimize/${productId}`, {
        method: 'POST'
      });
      const data = await res.json();
      setOptData(data);
      showToast("Pricing optimized by AI engine!");
      loadData();
    } catch (e) {
      showToast("Optimization engine timeout or error.", "error");
    } finally {
      setLoadingOpt(false);
    }
  };

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
        <div>
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

          {aiSummary && (
            <div className="ai-summary-box" style={{ marginBottom: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                <span>AI Sentiment analysis</span>
              </h3>
              <p style={{ color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6' }}>{aiSummary}</p>
            </div>
          )}

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
