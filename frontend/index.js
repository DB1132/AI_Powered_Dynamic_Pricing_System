fetch("http://localhost:8081/products")
.then(res => res.json())
.then(data => {

let container = document.getElementById("products")

data.forEach(p => {

let card = document.createElement("div")
card.className = "card"

card.innerHTML = `
<h3>${p.productName}</h3>
<p class="price">₹ ${p.currentPrice}</p>
<button onclick="openProduct(${p.id})">View Details</button>
`;

container.appendChild(card)

})
})

function openProduct(id){
window.location.href = `product.html?id=${id}`
}