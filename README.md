# AI-Powered Dynamic Pricing & Revenue Optimization System

An enterprise-grade full-stack application that combines **Predictive Machine Learning** for demand forecasting and **Generative AI** for customer feedback analysis to dynamically optimize product pricing and maximize total business revenue.

---

## 🚀 Key Features

### 1. Admin Control & Optimization Dashboard
* **Dynamic Revenue Curve:** Simulates 30 distinct price points (from 50% to 150% of base price) and plots expected revenue in real-time, highlighting the **Optimal Price Peak** (Red Dot) where revenue is maximized.
* **Price History Log:** Tracks historical pricing recommendations in a clean time-series chart to evaluate pricing patterns.
* **Simulation Sandbox:** Interactive controls to adjust price parameters (Competitor Price, Discount %, Stock Levels, Promotion active, Epidemic Lockdowns) to preview simulated demand trends before applying changes.
* **Add Product Modal:** Form to add new products directly into the catalog.

### 2. GenAI Review Sentiment Summarization
* Integrates **Google Gemini API** to analyze customer reviews, detect user sentiment, and write 3-4 line summary highlights of key customer feedback.

### 3. Customer E-Commerce Storefront
* Modern retail catalog layout displaying products, category filters, search bars, and live stock statuses.
* **"Buy Now" Purchase Simulation:** Dynamic stock decrementing in the database upon check-out, with interactive success confetti animations.
* **Scarcity Alerts:** Warning badges (`🔥 Low Stock`) that warn customers if inventory drops below 30 units, indicating potential AI-driven price increases.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend UI** | React (Vite), Chart.js (React ChartJS 2), Lucide Icons, Canvas Confetti |
| **Backend API** | Java (Spring Boot 3), Spring Data JPA, Hibernate, MySQL Database |
| **AI Microservice** | Python (Flask), Scikit-Learn, Pandas, NumPy, Joblib |
| **Generative AI** | Google Gemini API (AI Studio) |

---

## 📂 Project Structure

```
├── backend/                  # Java Spring Boot Backend Service
│   ├── src/main/java/        # API Controllers, Repositories, Models & Services
│   └── src/main/resources/   # Application properties configuration template
├── frontend/                 # React Vite Single Page App
│   ├── src/pages/            # Admin, Customer, and Product Details view modules
│   ├── src/App.jsx           # Routing & layout shell
│   └── src/index.css         # Glassmorphic dark-mode CSS design system
├── ml_script/                # Python Flask ML Service
│   ├── ml_api.py             # Flask API endpoints for demand forecasting
│   ├── demand_model.pkl      # Trained DecisionTree/RandomForest regression model
│   └── requirements.txt      # Python dependencies
└── ecom.sql                  # MySQL database dump (schemas, product & review seeds)
```

---

## ⚙️ Installation & Local Setup

### Step 1: Database Setup (MySQL)
1. Open your local MySQL instance (e.g., via XAMPP, phpMyAdmin, or terminal).
2. Create a database named `ecom`.
3. Import the `ecom.sql` file located in the project root:
   ```bash
   mysql -u root -p ecom < ecom.sql
   ```

### Step 2: Set Up Google Gemini API Key
1. Generate an API Key on [Google AI Studio](https://aistudio.google.com/).
2. Create a file named `application.properties` inside `backend/src/main/resources/` (using `application.properties.example` as a template).
3. Set your database credentials and Gemini API Key:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ecom
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD

   gemini.api.key=YOUR_GEMINI_API_KEY
   ```

### Step 3: Run the Python ML Service
1. Navigate to the `ml_script` directory:
   ```bash
   cd ml_script
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask API server:
   ```bash
   python ml_api.py
   ```
   *(Running on http://localhost:5000)*

### Step 4: Run the Java Backend Service
1. Open the `backend/` folder in your IDE (IntelliJ IDEA or Eclipse).
2. Allow Maven to download dependencies.
3. Start the Spring Boot Application class.
   *(Running on http://localhost:8081)*

### Step 5: Run the React Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *(Running on http://localhost:5173)*

---

## 📊 How It Works (AI Business Logic)
1. **Dynamic Demand Estimation:** When a pricing scenario is tested, the Flask API uses a trained regression model (`demand_model.pkl`) to estimate the base demand by parsing 20+ features, including `Competitor Pricing`, `Discount`, `Inventory Level`, `Promotion`, `Weather`, and `Seasonality`.
2. **Elasticity Simulation:** The pricing engine calculates expected demand at 30 different price points using:
   $$\text{Demand} = \text{Predicted Demand} - k \times (\text{Price} - \text{Base Price})$$
3. **Revenue Optimization:** The system maps the revenue curve:
   $$\text{Revenue} = \text{Price} \times \text{Demand}$$
   It then selects and suggests the price point at the peak of the curve to the seller.

   ---

# 👨‍💻 Author

**Dip Baldha**

GitHub: https://github.com/DB1132

LinkedIn: https://www.linkedin.com/in/dip-baldha-492596288/

---

# ⭐ If you like this project

Give this repository a ⭐ on GitHub if you found it useful.
