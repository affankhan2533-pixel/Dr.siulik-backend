# Dr.siulik-backend

REST API Backend service for **Dr. Siulik's Dental Care** web application.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, Dotenv

---

## 📁 Repository Structure

```
Dr.siulik-backend/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── clinicController.js
│   │   ├── contactController.js
│   │   ├── reviewController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   └── errorMiddleware.js    # Global error & 404 handlers
│   ├── models/
│   │   ├── Appointment.js
│   │   └── Contact.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── clinicRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── serviceRoutes.js
│   └── server.js                 # App entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dr_siulik_dental
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```

### 3. Run in Production Mode
```bash
npm start
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | Server health check |
| `POST` | `/api/appointments` | Book/request an appointment |
| `GET` | `/api/appointments` | Fetch appointments list |
| `POST` | `/api/contact` | Submit a contact/inquiry form |
| `GET` | `/api/reviews` | Fetch clinic reviews |
| `GET` | `/api/services` | Fetch dental service categories |
| `GET` | `/api/clinic` | Fetch clinic metadata and contact info |
