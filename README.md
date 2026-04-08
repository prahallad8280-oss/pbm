# CSIR NET Mock Tests

Full-stack mock test platform for CSIR NET preparation with learner authentication, timed tests, result analytics, attempt history, and an admin panel for managing categories and questions.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, React Router, Axios, Vite
- Auth: Email/password login with role-based route protection

## Folder Structure

```text
.
|-- client
|   |-- .env
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src
|       |-- api
|       |   `-- client.js
|       |-- components
|       |   |-- admin
|       |   |   `-- QuestionForm.jsx
|       |   |-- common
|       |   |   `-- StatCard.jsx
|       |   |-- layout
|       |   |   |-- AppShell.jsx
|       |   |   `-- ProtectedRoute.jsx
|       |   `-- tests
|       |       |-- QuestionCard.jsx
|       |       `-- TimerBar.jsx
|       |-- context
|       |   `-- AuthContext.jsx
|       |-- hooks
|       |   `-- useTimer.js
|       |-- pages
|       |   |-- admin
|       |   |   |-- AdminDashboardPage.jsx
|       |   |   |-- CategoryManagerPage.jsx
|       |   |   `-- QuestionManagerPage.jsx
|       |   |-- auth
|       |   |   |-- LoginPage.jsx
|       |   |   `-- RegisterPage.jsx
|       |   `-- user
|       |       |-- AttemptHistoryPage.jsx
|       |       |-- DashboardPage.jsx
|       |       |-- TestAttemptPage.jsx
|       |       `-- TestResultPage.jsx
|       |-- styles
|       |   `-- index.css
|       |-- App.jsx
|       `-- main.jsx
|-- server
|   |-- .env
|   |-- .env.example
|   |-- package.json
|   `-- src
|       |-- app.js
|       |-- server.js
|       |-- config
|       |   |-- db.js
|       |   `-- env.js
|       |-- controllers
|       |   |-- adminController.js
|       |   |-- authController.js
|       |   |-- categoryController.js
|       |   `-- testController.js
|       |-- data
|       |   `-- seedData.js
|       |-- middleware
|       |   |-- authMiddleware.js
|       |   `-- errorMiddleware.js
|       |-- models
|       |   |-- Question.js
|       |   |-- TestAttempt.js
|       |   |-- TestCategory.js
|       |   `-- User.js
|       |-- routes
|       |   |-- adminRoutes.js
|       |   |-- authRoutes.js
|       |   |-- categoryRoutes.js
|       |   `-- testRoutes.js
|       `-- utils
|           |-- asyncHandler.js
|           |-- generateToken.js
|           `-- testUtils.js
|-- .gitignore
|-- package.json
`-- README.md
```

## API Routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User Test Flow

- `GET /api/categories`
- `POST /api/tests/start`
- `POST /api/tests/:attemptId/submit`
- `GET /api/tests/attempts`
- `GET /api/tests/attempts/:attemptId`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/questions`
- `POST /api/admin/questions`
- `PUT /api/admin/questions/:questionId`
- `DELETE /api/admin/questions/:questionId`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:categoryId`
- `DELETE /api/admin/categories/:categoryId`

## Included Features

- User registration/login with JWT auth
- Admin role-based access control
- Subject-wise and full length tests
- Randomized question selection per attempt
- Timer-based submission flow
- Score, correct count, incorrect count, and percentage accuracy
- Detailed per-question solution review
- Stored attempt history
- Admin category and question management
- Seed script with sample categories, questions, admin, and student accounts

## Seeded Accounts

- Admin: `admin@csirmocktest.com` / `Admin@123`
- Student: `student@csirmocktest.com` / `Student@123`

## Setup

1. Run `npm install`
2. Start MongoDB locally
3. Run `npm run seed`
4. Run `npm run dev`
