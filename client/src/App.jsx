import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";
import PageTransition from "./components/layout/PageTransition.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import RouteFeedback from "./components/layout/RouteFeedback.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import FeedbackManagerPage from "./pages/admin/FeedbackManagerPage.jsx";
import NotificationManagerPage from "./pages/admin/NotificationManagerPage.jsx";
import TestBuilderPage from "./pages/admin/TestBuilderPage.jsx";
import TrackBoardManagerPage from "./pages/admin/TrackBoardManagerPage.jsx";
import UserManagerPage from "./pages/admin/UserManagerPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ExamTrackPage from "./pages/public/ExamTrackPage.jsx";
import LandingPage from "./pages/public/LandingPage.jsx";
import PublicTestAttemptPage from "./pages/public/PublicTestAttemptPage.jsx";
import PublicTestResultPage from "./pages/public/PublicTestResultPage.jsx";
import AttemptHistoryPage from "./pages/user/AttemptHistoryPage.jsx";
import DashboardPage from "./pages/user/DashboardPage.jsx";
import TestAttemptPage from "./pages/user/TestAttemptPage.jsx";
import TestResultPage from "./pages/user/TestResultPage.jsx";

const App = () => (
  <>
    <RouteFeedback />
    <Routes>
      <Route
        path="/"
        element={
          <PageTransition>
            <LandingPage />
          </PageTransition>
        }
      />
      <Route
        path="/login"
        element={
          <PageTransition>
            <LoginPage />
          </PageTransition>
        }
      />
      <Route
        path="/register"
        element={
          <PageTransition>
            <RegisterPage />
          </PageTransition>
        }
      />
      <Route
        path="/exam-tracks/:slug"
        element={
          <PageTransition>
            <ExamTrackPage />
          </PageTransition>
        }
      />
      <Route
        path="/open-tests/:featuredKey"
        element={
          <PageTransition>
            <PublicTestAttemptPage />
          </PageTransition>
        }
      />
      <Route
        path="/open-tests/:featuredKey/result"
        element={
          <PageTransition>
            <PublicTestResultPage />
          </PageTransition>
        }
      />

      <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
        <Route
          path="/tests/start/:categoryId"
          element={
            <PageTransition>
              <TestAttemptPage />
            </PageTransition>
          }
        />
      </Route>

      <Route element={<ProtectedRoute roles={["user", "admin"]} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attempts" element={<AttemptHistoryPage />} />
          <Route path="/results/:attemptId" element={<TestResultPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin", "editor"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin/tests" element={<TestBuilderPage />} />
          <Route path="/admin/track-boards" element={<TrackBoardManagerPage />} />
          <Route path="/admin/questions" element={<Navigate to="/admin/tests" replace />} />
          <Route path="/admin/categories" element={<Navigate to="/admin/tests" replace />} />
          <Route path="/admin/notifications" element={<NotificationManagerPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AppShell />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/feedback" element={<FeedbackManagerPage />} />
          <Route path="/admin/users" element={<UserManagerPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default App;
