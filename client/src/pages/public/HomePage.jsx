import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const examPointers = [
  "CSIR NET is conducted for Junior Research Fellowship and eligibility for lectureship or assistant professor roles in science streams.",
  "Preparation works best when concept revision is paired with timed mock practice and honest review of mistakes.",
  "This portal is designed to help aspirants practice subject-wise tests as well as full length tests from one place.",
];

const HomePage = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalClosing, setAuthModalClosing] = useState(false);
  const [authMode, setAuthMode] = useState("login");

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

  return (
    <div className="home-page">
      <div className="home-topbar">CSIR NET mock tests for Lectureship and JRF preparation</div>

      <header className="site-header">
        <div className="home-shell site-header-inner">
          <Link to="/" className="site-brand">
            <span className="site-brand-mark">CSIR</span>
            <div>
              <p>CSIR NET Mock Test</p>
              <span>Exam practice portal</span>
            </div>
          </Link>

          <nav className="site-nav">
            {user ? (
              <Link to={user.role === "admin" ? "/admin" : "/dashboard"}>Dashboard</Link>
            ) : (
              <button
                type="button"
                className="site-nav-button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthModalOpen(true);
                }}
              >
                Login
              </button>
            )}
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="landing-hero">
          <div className="home-shell">
            <div className="landing-hero-copy">
              <p className="section-tag">CSIR UGC NET preparation portal</p>
              <h1>CSIR UGC National Eligibility Test (CSIR NET) Mock Test for Lectureship and JRF</h1>
              <p className="landing-summary">
                Prepare with subject-wise tests, full length mock exams, timer-based practice, and clear post-test
                analysis designed to make revision more disciplined.
              </p>

              <div className="landing-actions">
                <a href="#exam-info" className="button button-secondary">
                  Read Exam Info
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="exam-info" className="content-section">
          <div className="home-shell content-layout">
            <article className="content-article">
              <p className="section-tag">About the exam</p>
              <h2>Understand the exam before you start solving mocks.</h2>
              <p>
                The Council of Scientific and Industrial Research conducts the CSIR NET examination to evaluate
                candidates for research fellowship and eligibility in higher education teaching pathways across major
                science disciplines.
              </p>
              <p>
                Serious preparation usually needs three things working together: concept clarity, timed problem
                practice, and structured review after each test. A mock test is not just for checking marks. It should
                also help you improve pacing, remove weak areas, and build exam confidence over time.
              </p>
              <p>
                This platform is designed around that cycle. Students can practice tests, view scores, check detailed
                explanations, and revisit previous attempts to track how their preparation is moving.
              </p>
            </article>

            <aside className="content-aside">
              <h3>Exam essentials</h3>
              <ul className="info-list">
                {examPointers.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section id="about" className="about-section">
          <div className="home-shell about-layout">
            <div className="about-text">
              <p className="section-tag">About Me</p>
              <h2>Built to make CSIR NET practice feel more organized and less scattered.</h2>
              <p>
                This portal is meant for learners who want a simple place to practice regularly, review mistakes, and
                stay close to the exam pattern without depending on random disconnected resources.
              </p>
              <p>
                You can later replace this content with your own personal introduction, institute details, mentoring
                approach, or academic background. The structure is here so the page already feels like a proper exam
                website.
              </p>
            </div>

            <div className="about-points">
              <div>
                <strong>Subject-wise tests</strong>
                <p>Revise one stream at a time and build stronger topic coverage.</p>
              </div>
              <div>
                <strong>Full length mocks</strong>
                <p>Practice under pressure before the actual exam day.</p>
              </div>
              <div>
                <strong>Result analysis</strong>
                <p>See score, accuracy, and explanations after each attempt.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="home-shell contact-layout">
            <div>
              <p className="section-tag">Contact</p>
              <h2>Need help with access, support, or platform updates?</h2>
            </div>

            <div className="contact-details">
              <p>
                <strong>Email:</strong> contact@csirmocktest.com
              </p>
              <p>
                <strong>Support hours:</strong> Monday to Saturday
              </p>
              <p>
                <strong>Access:</strong> Students can register normally, and admins can manage the question bank after
                login.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="home-shell site-footer-inner">
          <div>
            <p className="section-tag">CSIR NET Mock Test</p>
            <h3>Practice regularly, review carefully, and improve with every attempt.</h3>
          </div>

          <div className="footer-links">
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
            <button
              type="button"
              className="site-nav-button footer-action-button"
              onClick={() => {
                setAuthMode("login");
                setAuthModalOpen(true);
              }}
            >
              Login
            </button>
          </div>
        </div>
      </footer>

      {loginModalOpen ? (
        <div
          className={`auth-modal-overlay ${loginModalClosing ? "closing" : ""}`}
          onClick={closeLoginModal}
          role="presentation"
        >
          <div
            className={`auth-modal-shell ${loginModalClosing ? "closing" : ""}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Login"
          >
            <button type="button" className="auth-modal-close" onClick={closeLoginModal} aria-label="Close login">
              ×
            </button>
            <LoginForm showRegisterLink={false} onSuccess={() => setLoginModalOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default HomePage;
