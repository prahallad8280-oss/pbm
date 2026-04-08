# CSIR NET Mock Test Platform

A full-stack web application for CSIR NET exam preparation.

## 🚀 Features

* User authentication (JWT based)
* Subject-wise tests and Full Length Tests (FLT)
* Timed MCQ test system
* Detailed result analysis
* Attempt history tracking
* Admin dashboard for managing questions

## 🛠 Tech Stack

* Frontend: React (Vite)
* Backend: Node.js + Express
* Database: MongoDB

## 📂 Project Structure

* `/client` → Frontend (React)
* `/server` → Backend (API)

## ⚙️ Setup

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## 🔐 Environment Variables

Create `.env` in server:

```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

---

## 📌 Future Improvements

* CSIR NET Part A/B/C pattern
* Negative marking
* Performance analytics
* UI improvements

---

## 👨‍💻 Author

Prahallad Bagh
