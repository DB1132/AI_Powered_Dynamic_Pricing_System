const params = new URLSearchParams(window.location.search)
const id = params.get("id")

// Load product
fetch("http://localhost:8081/products/" + id)
.then(res => res.json())
.then(p => {
console.log(p)
document.getElementById("name").innerText = p.productName
document.getElementById("price").innerText = p.currentPrice

})

// Load reviews
fetch("http://localhost:8081/reviews/" + id)
.then(res => res.json())
.then(data => {

let div = document.getElementById("reviews")
div.innerHTML = "" // clear

// ⭐ Average Rating
let avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length

let ratingDiv = document.createElement("h3")
ratingDiv.innerText = "Average Rating: " + avg.toFixed(1)
div.appendChild(ratingDiv)

// Reviews list
data.forEach(r => {

let p = document.createElement("div")
p.className = "review"

p.innerHTML = `
<b>${r.reviewerName}</b>
<div class="rating">⭐ ${r.rating}</div>
<p>${r.reviewText}</p>
`

div.appendChild(p)

})

})

function optimize(){

fetch("http://localhost:8081/pricing/optimize/" + id,{
method:"POST"
})
.then(res=>res.json())
.then(data=>{

// Better UI output
document.getElementById("result").innerText =
`Optimal Price: ₹${data.optimal_price}
Expected Demand: ${data.expected_demand}
Expected Revenue: ₹${data.expected_revenue}`

// Draw graphs
loadHistory(id)
drawRevenueCurve(data.tested_prices,data.revenues)


})
}

function loadHistory(id) {

fetch("http://localhost:8081/pricing/history/" + id)
.then(res => res.json())
.then(data => {

let prices = data.map(x => x.newPrice)
let dates = data.map(x => new Date(x.updatedAt).toLocaleString())

let ctx = document.getElementById("chart").getContext("2d")

// destroy old chart
if(window.priceChart && typeof window.priceChart.destroy === "function"){
    window.priceChart.destroy()
}

window.priceChart = new Chart(ctx, {
type: "line",
data: {
labels: dates,
datasets: [{
label: "Price History",
data: prices,
borderColor: "blue",
backgroundColor: "lightblue",
borderWidth: 2,
fill: false,
tension: 0.2
}]
},
options: {
scales: {
x: {
title: {
display: true,
text: "Time"
}
},
y: {
title: {
display: true,
text: "Price"
}
}
}
}
})

})
}

function generateDescription(){

fetch("http://localhost:8081/ai/description/" + id,{
method:"POST"
})
.then(res=>res.json())
.then(data=>{

document.getElementById("description").innerText = data.summary

})
}


// 🔥 UPDATED GRAPH FUNCTION (WITH OPTIMAL POINT)
function drawRevenueCurve(prices, revenues){

let ctx = document.getElementById("revenueChart").getContext("2d")

if(window.revenueChart && typeof window.revenueChart.destroy === "function"){
window.revenueChart.destroy()
}

// Find optimal point
let maxRevenue = Math.max(...revenues)
let index = revenues.indexOf(maxRevenue)
let optimalPrice = prices[index]

window.revenueChart = new Chart(ctx, {

type: "line",

data: {
labels: prices,
datasets: [
{
label: "Revenue",
data: revenues,
borderColor: "green",
backgroundColor: "lightgreen",
borderWidth: 2,
fill: false,
tension: 0.2
},
{
type: 'scatter',
label: 'Optimal Point',
data: [{x: optimalPrice, y: maxRevenue}],
pointRadius: 6,
backgroundColor: "red"
}
]
},

options: {
scales: {
x: {
type: 'linear',
title: {
display: true,
text: "Price"
}
},
y: {
title: {
display: true,
text: "Revenue"
}
}
}
}

})

}




// const params = new URLSearchParams(window.location.search)
// const id = params.get("id")

// // Load product
// fetch("http://localhost:8081/products/" + id)
// .then(res => res.json())
// .then(p => {

// document.getElementById("name").innerText = p.productName
// document.getElementById("price").innerText = p.currentPrice

// })

// // Load reviews (you will add API)
// fetch("http://localhost:8081/reviews/" + id)
// .then(res => res.json())
// .then(data => {

// let div = document.getElementById("reviews")

// data.forEach(r => {
// let p = document.createElement("p")
// p.innerHTML = `
// <b>${r.reviewerName}</b> ⭐${r.rating}<br>
// ${r.reviewText}
// <hr>
// `
// div.appendChild(p)
// })

// })

// function optimize(){

// fetch("http://localhost:8081/pricing/optimize/" + id,{
// method:"POST"
// })
// .then(res=>res.json())
// .then(data=>{

// document.getElementById("result").innerText =
// `Optimal Price: ${data.optimal_price}
// Demand: ${data.expected_demand}
// Revenue: ${data.expected_revenue}`

// drawRevenueCurve(data.tested_prices,data.revenues)
// loadHistory(id)

// })
// }

// function generateDescription(){

// fetch("http://localhost:8081/ai/description/" + id,{
// method:"POST"
// })
// .then(res=>res.json())
// .then(data=>{

// document.getElementById("description").innerText = data.summary

// })
// }