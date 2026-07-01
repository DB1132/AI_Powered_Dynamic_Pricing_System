fetch("http://localhost:8081/products")
.then(res=>res.json())
.then(data=>{

let table=document.getElementById("productTable")

data.forEach(p=>{

let row=table.insertRow()

row.insertCell(0).innerText=p.id
row.insertCell(1).innerText=p.productName
row.insertCell(2).innerText=p.currentPrice

let btn=document.createElement("button")
btn.innerText="Optimize"

btn.onclick=()=>optimize(p.id)

row.insertCell(3).appendChild(btn)

})
})

function optimize(id){

fetch("http://localhost:8081/pricing/optimize/"+id,
{method:"POST"})
.then(res=>res.json())
.then(data=>{
console.log("ML API returned:", data);
alert(
"Optimal Price:"+data.optimal_price+
"\nDemand:"+data.expected_demand+
"\nRevenue:"+data.expected_revenue
)

loadHistory(id)
drawRevenueCurve(data.tested_prices,data.revenues)
})
}

let priceChart; // global variable

function loadHistory(id) {

    fetch("http://localhost:8081/pricing/history/" + id)
    .then(res => res.json())
    .then(data => {

        let prices = data.map(x => x.newPrice);
        let dates = data.map(x => new Date(x.updatedAt).toLocaleString()); // human-readable

        // Destroy previous chart if exists
        if (priceChart) {
            priceChart.destroy();
        }

        priceChart = new Chart(document.getElementById("chart"), {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    label: "Price",
                    data: prices,
                    borderColor: "blue",
                    backgroundColor: "lightblue",
                    fill: false,
                    tension: 0.2
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Date' }
                    },
                    y: {
                        title: { display: true, text: 'Price' },
                        beginAtZero: false
                    }
                }
            }
        });
    });
}


// function drawRevenueCurve(prices,revenues){

// let ctx=document.getElementById("revenueChart").getContext("2d")

// if(window.revenueChart){
// window.revenueChart.destroy()
// }

// window.revenueChart=new Chart(ctx,{

// type:"line",

// data:{
// labels:prices,
// datasets:[{

// label:"Revenue",
// data:revenues,
// borderWidth:2,
// fill:false

// }]
// },

// options:{
// scales:{
// x:{
// title:{
// display:true,
// text:"Price"
// }
// },
// y:{
// title:{
// display:true,
// text:"Revenue"
// }
// }
// }
// }

// })

// }

function drawRevenueCurve(prices, revenues){
    let ctx = document.getElementById("revenueChart").getContext("2d");

    // Only destroy if it's a Chart instance
    if(window.revenueChart && typeof window.revenueChart.destroy === "function"){
        window.revenueChart.destroy();
    }

    window.revenueChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: prices,
            datasets: [{
                label: "Revenue",
                data: revenues,
                borderColor: "green",
                backgroundColor: "lightgreen",
                borderWidth: 2,
                fill: false,
                tension: 0.2
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear', // makes X-axis numeric
                    title: { display: true, text: "Price" }
                },
                y: {
                    title: { display: true, text: "Revenue" }
                }
            }
        }
    });
}