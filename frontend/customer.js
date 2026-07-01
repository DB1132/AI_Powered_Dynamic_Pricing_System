// customer.js
// Fetch and display products for customer dashboard

document.addEventListener('DOMContentLoaded', async () => {
    const productsDiv = document.getElementById('products');
    try {
        // Fetch products from backend (adjust endpoint if needed)
        const res = await fetch('http://localhost:8081/products');
        const products = await res.json();
        productsDiv.innerHTML = '';
        for (const product of products) {
            let priceHtml = `<span class="price">₹${product.currentPrice}</span>`;
            try {
                const historyRes = await fetch(`http://localhost:8081/pricing/history/${product.id}`);
                const history = await historyRes.json();
                if (history && history.length > 0) {
                    const latest = history[history.length - 1];
                    if (latest.newPrice < product.currentPrice) {
                        const discount = Math.round(100 * (product.currentPrice - latest.newPrice) / product.currentPrice);
                        priceHtml = `<span class="original-price">₹${product.currentPrice}</span> <span class="price">₹${latest.newPrice.toFixed(2)}</span> <span class="discount">-${discount}%</span>`;
                    }
                }
            } catch (e) { /* ignore errors */ }
            productsDiv.innerHTML += `
        <div class="card">
            <h3>${product.productName}</h3>
            <div style="margin: 10px 0;">
                ${priceHtml}
            </div>
        </div>
    `;
        }
    } catch (err) {
        productsDiv.innerHTML = '<div style="color:red">Failed to load products.</div>';
    }
});
