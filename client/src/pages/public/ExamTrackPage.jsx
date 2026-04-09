import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { getExamTrackBySlug } from "../../data/examTracks.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ExamTrackPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalClosing, setAuthModalClosing] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const track = getExamTrackBySlug(slug);

  const closeAuthModal = () => {
    setAuthModalClosing(true);
    window.setTimeout(() => {
      setAuthModalOpen(false);
      setAuthModalClosing(false);
      setAuthMode("login");
    }, 220);
  };

  useEffect(() => {
    if (!authModalOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeAuthModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [authModalOpen]);

  if (!track) {
    return <Navigate to="/" replace />;
  }

  const handleAuthAction = () => {
    if (user) {
      logout();
      if (authModalOpen) {
        closeAuthModal();
      }
      navigate(`/exam-tracks/${track.slug}`);
      return;
    }

    setAuthMode("login");
    setAuthModalOpen(true);
  };

  return (
    <div className="home-page">
      <div className="home-topbar">Practice for CSIR NET, GATE, Odisha Assistant Professor, NBHM, TIFR, and more</div>

      <header className="site-header">
        <div className="home-shell site-header-inner">
          <Link to="/" className="site-brand">
            <span className="site-brand-mark">MATH</span>
            <div>
              <p>Mathematics Exam Hub</p>
              <span>Mock tests, PYQs, and revision portal</span>
            </div>
          </Link>

          <nav className="site-nav">
            {user?.role === "admin" ? <Link to="/admin">Dashboard</Link> : null}
            <Link to="/">Home</Link>
            <button type="button" className="site-nav-button" onClick={handleAuthAction}>
              {user ? "Logout" : "Login/Signup"}
            </button>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="track-hero-section">
          <div className="home-shell">
            <p className="section-tag">{track.eyebrow}</p>
            <h1 className="track-page-title">{track.title}</h1>
            <p className="track-page-summary">{track.intro}</p>
          </div>
        </section>

        <section className="track-detail-section">
          <div className="home-shell track-detail-layout">
            <div className="track-detail-copy">
              <p className="section-tag">Overview</p>
              {track.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>

            <aside className="track-detail-aside">
              <p className="section-tag">Focus areas</p>
              <ul className="info-list">
                {track.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="track-resource-section">
          <div className="home-shell">
            <p className="section-tag">What will appear here</p>
            <h2 className="track-section-title">This track can grow with notices, PYQs, mocks, and revision material.</h2>
            <ul className="track-resource-list">
              {track.resources.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="track-page-actions">
              <Link to="/" className="button button-secondary">
                Back to home
              </Link>
              {!user ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthModalOpen(true);
                  }}
                >
                  Login/Signup
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="home-shell site-footer-inner">
          <div>
            <p className="section-tag">Mathematics Exam Hub</p>
            <h3>Practice regularly, review carefully, and prepare across exams with one steady system.</h3>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <button type="button" className="site-nav-button footer-action-button" onClick={handleAuthAction}>
              {user ? "Logout" : "Login/Signup"}
            </button>
          </div>
        </div>
      </footer>

      {authModalOpen ? (
        <div
          className={`auth-modal-overlay ${authModalClosing ? "closing" : ""}`}
          onClick={closeAuthModal}
          role="presentation"
        >
          <div
            className={`auth-modal-shell ${authModalClosing ? "closing" : ""}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={authMode === "login" ? "Login" : "Create account"}
          >
            <button type="button" className="auth-modal-close" onClick={closeAuthModal} aria-label="Close dialog">
              X
            </button>

            {authMode === "login" ? (
              <LoginForm
                showRegisterLink
                onSwitchToRegister={() => setAuthMode("register")}
                onSuccess={() => setAuthModalOpen(false)}
              />
            ) : (
              <RegisterForm
                showLoginLink
                onSwitchToLogin={() => setAuthMode("login")}
                onSuccess={() => setAuthModalOpen(false)}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExamTrackPage;

