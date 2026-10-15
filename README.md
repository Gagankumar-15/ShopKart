# 🛒 ShopKart — Full-Stack E-Commerce Platform

A production-grade, full-stack MERN (MongoDB, Express.js, React, Node.js) e-commerce web application featuring secure JWT authentication via `HttpOnly` cookies, dynamic product discovery, persistent wishlist and cart management, and payment gateway integration.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security (Lab 01 & Lab 02)
- **Zero Third-Party Auth Bloat:** Raw JWT authentication architecture with cryptographically hashed passwords using `bcrypt`.
- **HttpOnly Cookies:** Protection against Cross-Site Scripting (XSS) attacks by preventing client-side JavaScript access to tokens.
- **Protected Route Guards:** Full session validation middleware for stateful operations (`/cart`, `/wishlist`, `/orders`, etc.).
- **Password Management:** Secure password update endpoint with current password verification.

### 🔍 2. Product Discovery & Catalog (Lab 03)
- **Live Search & Category Filtering:** Search by keyword and filter by category (Electronics, Fashion, Books, Home).
- **Stock Tracking:** Real-time stock status (in-stock indicators, low-stock warnings, and out-of-stock badges).
- **Responsive Product Cards:** Modern, accessible cards displaying pricing formatted in INR (₹).

### ❤️ 3. Wishlist System (Lab 04)
- **Relational Data Mapping:** Customer-to-Product reference architecture in MongoDB.
- **One-Click Toggle:** Add or remove items directly from the catalog or product details page.
- **Dedicated Wishlist View:** View saved items with direct links to details or cart migration.

### 🛍️ 4. Shopping Cart & State Management (Lab 05)
- **Centralized Cart State:** React Context API (`CartContext`) managing cart syncing and badge counts.
- **Quantity Adjustments:** Real-time increment/decrement with backend stock ceiling enforcement.
- **Derived Financial Calculations:** Dynamic subtotal, tax computation (18% GST), and free shipping breakdown.

### 💳 5. Checkout, Payments & Orders (Lab 06)
- **Order Pipeline:** Structured checkout flow capturing shipping and billing addresses.
- **Razorpay Integration:** Order generation and cryptographic HMAC payment signature verification.
- **Order History:** Complete customer order tracking with status updates and itemized breakdowns.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v6, Axios, Lucide React |
| **Backend** | Node.js, Express.js, Mongoose ODM, JSONWebToken, Cookie-Parser, CORS, Bcrypt |
| **Database** | MongoDB Atlas (Cloud Database) |
| **Payment Gateway** | Razorpay SDK |

---

## 📂 Project Structure

```text
ShopKart/
├── backend/
│   ├── config/             # Third-party configurations (e.g. Razorpay)
│   ├── controllers/        # Business logic handlers
│   │   ├── cart.controller.js
│   │   ├── customer.controller.js
│   │   ├── order.controller.js
│   │   ├── product.controller.js
│   │   └── wishlist.controller.js
│   ├── middlewares/        # Authentication & validation middlewares
│   │   └── auth.middleware.js
│   ├── models/             # Mongoose schemas (Customer, Product, Order)
│   ├── routes/             # Express API route declarations
│   ├── utils/              # Helper utilities (generateToken.js)
│   ├── .env.example        # Environment variables template
│   ├── index.js            # Express server entry point
│   └── seed.js             # Database seeder script with sample products
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, ProductCard)
│   │   ├── context/        # React Context providers (AuthContext, CartContext)
│   │   ├── pages/          # Application views (Products, Cart, Wishlist, Checkout, Orders)
│   │   ├── App.jsx         # App routing & protected route wrappers
│   │   ├── index.css       # Tailwind CSS v4 imports
│   │   └── main.jsx        # React root hydration
│   └── vite.config.js      # Vite build configuration with Tailwind plugin
├── .gitignore              # Git ignore rules (protects .env and node_modules)
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A [MongoDB Atlas](https://www.mongodb.com/atlas/database) account or a local MongoDB server running.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Gagankumar-15/ShopKart.git
cd ShopKart
```

---

### Step 2: Backend Setup & Configuration

1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your environment configuration file:
   ```bash
   cp .env.example .env
   ```

3. Open `backend/.env` and fill in your values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.yourcluster.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development

   # Optional (for Lab 06 Razorpay payments)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

   > [!IMPORTANT]
   > In MongoDB Atlas, ensure your current IP address is whitelisted in **Network Access** (or set to `0.0.0.0/0` to allow access from anywhere during development).

4. **Seed the database with sample products:**
   ```bash
   node seed.js
   ```
   *(This populates your MongoDB cluster with ready-to-test sample electronics, books, fashion, and home goods).*

5. Start the backend server:
   ```bash
   node index.js
   ```
   The backend will be running at `http://localhost:5000`.

---

### Step 3: Frontend Setup

1. Open a **new terminal**, navigate to the `frontend` directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the printed local URL (typically **`http://localhost:5173`** or **`http://localhost:5174`**).

---

## 📡 API Reference

### 👤 Customer & Auth Routes (`/customers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/customers/register` | Register a new customer | No |
| `POST` | `/customers/login` | Authenticate customer & set `jwt` cookie | No |
| `POST` | `/customers/logout` | Clear auth cookie | Yes |
| `GET` | `/customers/me` | Retrieve authenticated profile | Yes |
| `PATCH` | `/customers/change-password` | Update account password | Yes |

### 📦 Product Routes (`/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/products` | List all products (supports `?search=` and `?category=`) | No |
| `GET` | `/products/:id` | Get single product by ID | No |
| `POST` | `/products` | Create a new product | No |

### ❤️ Wishlist Routes (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/wishlist` | Get user's saved wishlist products | Yes |
| `POST` | `/wishlist/:productId` | Add a product to wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove a product from wishlist | Yes |

### 🛒 Cart Routes (`/cart`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/cart` | Get user's shopping cart | Yes |
| `POST` | `/cart/:productId` | Add product to cart with quantity | Yes |
| `PUT` | `/cart/:productId` | Update item quantity | Yes |
| `DELETE` | `/cart/:productId` | Remove item from cart | Yes |

### 📦 Order Routes (`/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/orders/create-payment-order`| Generate Razorpay order | Yes |
| `POST` | `/orders/verify-payment` | Verify HMAC signature & persist order | Yes |
| `GET` | `/orders` | View logged-in customer's orders | Yes |
| `GET` | `/orders/:id` | View specific order details | Yes |

---

## 🧪 Testing with Postman

Since the application uses **`HttpOnly` cookies** for security, Postman automatically captures and passes the `jwt` cookie between requests:

1. **Register or Login**:
   - `POST` to `http://localhost:5000/customers/login` with body:
     ```json
     {
       "email": "test@example.com",
       "password": "password123"
     }
     ```
2. **Access Protected Endpoints**:
   - `GET` to `http://localhost:5000/customers/me` or `http://localhost:5000/cart`. Postman will automatically include the cookie in the headers.

---

## 🛡️ Security Best Practices Followed
- ✅ **Environment Isolation:** Sensitive MongoDB URIs and JWT secrets are kept in `.env` and strictly excluded via `.gitignore`.
- ✅ **HttpOnly & Secure Cookies:** Mitigates XSS attacks by isolating session tokens from DOM scripts.
- ✅ **Bcrypt Hashing:** Salted passwords hashed with 10 rounds.
- ✅ **CORS White-listing:** Configured for local client ports with `credentials: true`.
- ✅ **Stock Validation:** Backend-enforced bounds checking prevents cart quantities from exceeding inventory.

---

## 👤 Author
- **Gagan Kumar** - [GitHub Profile](https://github.com/Gagankumar-15)
