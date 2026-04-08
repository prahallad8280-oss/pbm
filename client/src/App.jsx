import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import CategoryManagerPage from "./pages/admin/CategoryManagerPage.jsx";
import QuestionManagerPage from "./pages/admin/QuestionManagerPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import HomePage from "./pages/public/HomePage.jsx";
import AttemptHistoryPage from "./pages/user/AttemptHistoryPage.jsx";
import DashboardPage from "./pages/user/DashboardPage.jsx";
import TestAttemptPage from "./pages/user/TestAttemptPage.jsx";
import TestResultPage from "./pages/user/TestResultPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tests/start/:categoryId" element={<TestAttemptPage />} />
        <Route path="/attempts" element={<AttemptHistoryPage />} />
        <Route path="/results/:attemptId" element={<TestResultPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={["admin"]} />}>
      <Route element={<AppShell />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/questions" element={<QuestionManagerPage />} />
        <Route path="/admin/categories" element={<CategoryManagerPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
