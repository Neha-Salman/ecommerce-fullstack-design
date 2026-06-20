# 🛒 E-Commerce Fullstack Design

A fully responsive full-stack e-commerce web application built as part of a structured 3-week internship project at **DevelopersHub Corporation**.

---

## 🌐 Live Demo
- **Frontend:** (Vercel URL — add after deployment)
- **Backend API:** (Render URL — add after deployment)

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- TailwindCSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose
- JWT Authentication
- Bcrypt

---

## ✨ Features
- Responsive design for mobile, tablet, and desktop
- Product listing with search and category filters
- Product details page
- Add to cart with localStorage persistence
- User authentication (Register/Login) with JWT
- Protected routes for authenticated users
- Wishlist functionality
- Admin panel with full CRUD for products
- Protected admin routes (role-based access)

---

## 📁 Project Structure
ecommerce-fullstack-design/
├── frontend/         # React + Vite frontend
├── backend/          # Node.js + Express backend
└── README.md

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed
- MongoDB Atlas account

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173

Run the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
VITE_API_URL=http://localhost:5000

Run the frontend:
```bash
npm run dev
```

---

## 📦 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| GET | `/api/products/search?q=` | Search products |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

---

## 👩‍💻 Developed By
**Neha** — CS Student & Web Developer