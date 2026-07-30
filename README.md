# study-notes
study notes sem 6 gtu

---

## 📚 Study Notes Web Application

A full-stack web application for browsing and purchasing study notes (PDFs) and YouTube video lectures, organized by subject.

### Tech Stack
- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Frontend**: React.js + React Router
- **Auth**: JWT (JSON Web Tokens)
- **Payments**: Stripe Checkout
- **File Upload**: Multer

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Stripe account (for payments)

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Port to run backend (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Any long random string |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks |
| `CLIENT_URL` | Frontend URL (default: http://localhost:3000) |

Start the backend:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL (default: http://localhost:5000/api) |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_...) |

Start the frontend:
```bash
npm start
```

---

### 🔐 Creating an Admin User

Register a normal user via `/register`, then update the role directly in MongoDB:

```js
// In MongoDB shell or Compass (run after connecting and switching to the correct database)
use study-notes
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

Alternatively, use MongoDB Compass or Atlas UI to set `role: "admin"` on a user document.

---

### 💳 Stripe Setup

1. Create a free account at [stripe.com](https://stripe.com)
2. Get your **Secret Key** and **Publishable Key** from Stripe Dashboard → Developers → API Keys
3. For webhooks (optional, for production): Create a webhook endpoint pointing to `https://yourdomain.com/api/payments/webhook` with event `checkout.session.completed`
4. Use Stripe test cards: `4242 4242 4242 4242` (any future expiry, any CVC)

---

## 📁 Project Structure

```
backend/
  models/         # Mongoose schemas (User, Subject, Note, Video, Payment)
  middleware/     # JWT auth, admin auth
  routes/         # API route handlers
  uploads/        # Uploaded PDF/Word files (auto-created)
  server.js       # Express server entry point

frontend/
  public/         # Static HTML template
  src/
    api.js               # Axios instance with JWT interceptor
    context/             # React Auth context
    components/          # Navbar, SubjectCard
    pages/               # Home, Login, Register, SubjectPage, Dashboard, PaymentSuccess
    pages/admin/         # AdminDashboard, ManageSubjects, CreateSubject, UploadNote, AddVideo
```

---

## 🌟 Features

- Browse subjects (free & paid) without login
- Register/Login with JWT authentication
- Admin can create subjects, upload PDF notes, add YouTube videos
- Set subjects as FREE or PAID with configurable pricing
- Stripe Checkout integration for purchasing subjects
- After payment, users gain permanent access to notes and videos
- Admin dashboard with revenue and user stats
