import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api/client.js";
import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import MathText from "../../components/common/MathText.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { examTracks } from "../../data/examTracks.js";
import { getWorkspaceLabelForRole, getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const examPointers = [
  "One portal can support preparation for CSIR NET, GATE, Odisha state-level assistant professor exams, NBHM, TIFR, and related mathematics tests.",
  "Different exams need different practice styles, from full length mocks to PYQ-based revision and topic-wise drills.",
  "Preparation improves faster when every exam track still follows the same cycle of practice, review, and correction.",
];

const isExternalLink = (value = "") => /^https?:\/\//i.test(value);
const newsItemsPerPage = 4;

const formatNotificationDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return { day: "--", monthYear: "UPDATE" };
  }

  return {
    day: String(date.getDate()),
    monthYear: date
      .toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      })
      .replace(" ", " ")
      .toUpperCase(),
  };
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalClosing, setAuthModalClosing] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newsPage, setNewsPage] = useState(0);

  const notificationPages = useMemo(() => {
    if (!notifications.length) {
      return [[]];
    }

    const pages = [];
    for (let index = 0; index < notifications.length; index += newsItemsPerPage) {
      pages.push(notifications.slice(index, index + newsItemsPerPage));
    }
    return pages;
  }, [notifications]);

  const currentNotificationPage = notificationPages[newsPage] || [];

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

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (isMounted) {
          setNotifications(data);
        }
      } catch (_error) {
        if (isMounted) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (newsPage >= notificationPages.length) {
      setNewsPage(0);
    }
  }, [newsPage, notificationPages.length]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFeedbackForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const handleExamTrackAccess = (href) => {
    const target = String(href || "").trim();

    if (!target) {
      return;
    }

    if (isExternalLink(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(target);
  };
  const handleAuthAction = () => {
    if (user) {
      logout();
      if (authModalOpen) {
        closeAuthModal();
      }
      navigate("/");
      return;
    }

    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const handleNotificationClick = (link) => {
    const target = String(link || "").trim();

    if (!target) {
      return;
    }

    if (isExternalLink(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(target);
  };

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    if (feedbackError) {
      setFeedbackError("");
    }
    if (feedbackSuccess) {
      setFeedbackSuccess("");
    }
    setFeedbackForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();

    if (!feedbackForm.name.trim() || !feedbackForm.email.trim() || !feedbackForm.message.trim()) {
      setFeedbackError("Please fill in your name, email, and feedback before sending.");
      return;
    }

    setFeedbackError("");
    setFeedbackSuccess("");
    setFeedbackSubmitting(true);

    try {
      const { data } = await api.post("/feedback", {
        name: feedbackForm.name.trim(),
        email: feedbackForm.email.trim(),
        message: feedbackForm.message.trim(),
      });

      setFeedbackSuccess(data.message || "Feedback sent successfully.");
      setFeedbackForm({
        name: user?.name || "",
        email: user?.email || "",
        message: "",
      });
    } catch (error) {
      setFeedbackError(error.response?.data?.message || "Unable to send feedback right now. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
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
            {user ? <Link to={getWorkspacePathForRole(user.role)}>{getWorkspaceLabelForRole(user.role)}</Link> : null}
            <button type="button" className="site-nav-button" onClick={handleAuthAction}>
              {user ? "Logout" : "Login/Signup"}
            </button>
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main className="home-main">
        <section className="landing-hero">
          <div className="home-shell landing-hero-layout">
            <div className="landing-hero-feature">
              <div className="landing-hero-copy">
                <p className="section-tag">Competitive mathematics preparation portal</p>
                <h1>Mock tests, PYQs, and structured practice for CSIR NET, GATE, Odisha exams, NBHM, TIFR, and more</h1>
                <p className="landing-summary">
                  Prepare from one place with full length mocks, topic-wise practice, PYQ-oriented preparation, and
                  clear post-test analysis across multiple mathematics exam tracks.
                </p>

                <p className="landing-hero-note">One preparation space for mock tests, PYQs, and exam-wise updates.</p>
              </div>
            </div>

            <aside className="hero-news-feed">
              <div className="hero-news-header">
                <button
                  type="button"
                  className="hero-news-nav"
                  onClick={() =>
                    setNewsPage((current) => (current === 0 ? notificationPages.length - 1 : current - 1))
                  }
                  aria-label="Previous news items"
                >
                  &#8249;
                </button>

                <h3>News Feed</h3>

                <button
                  type="button"
                  className="hero-news-nav"
                  onClick={() => setNewsPage((current) => (current + 1) % notificationPages.length)}
                  aria-label="Next news items"
                >
                  &#8250;
                </button>
              </div>

              {currentNotificationPage.length ? (
                <div className="hero-news-list">
                  {currentNotificationPage.map((item) => {
                    const { day, monthYear } = formatNotificationDate(item.createdAt);

                    return (
                      <button
                        key={item._id}
                        type="button"
                        className="hero-news-item"
                        onClick={() => handleNotificationClick(item.link)}
                      >
                        <div className="hero-news-date">
                          <strong>{day}</strong>
                          <span>{monthYear}</span>
                        </div>

                        <MathText className="hero-news-title" text={item.title} />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="hero-news-empty">
                  <p>No notifications have been published yet.</p>
                </div>
              )}

              {notificationPages.length > 1 ? (
                <div className="hero-news-dots" aria-label="News feed pages">
                  {notificationPages.map((_, index) => (
                    <button
                      key={`news-page-${index}`}
                      type="button"
                      className={`hero-news-dot ${index === newsPage ? "active" : ""}`}
                      onClick={() => setNewsPage(index)}
                      aria-label={`Open news page ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="notice-board-section">
          <div className="home-shell">
            <div className="section-heading">
              <div>
                <p className="section-tag">Exam tracks</p>
                <h2>Choose the exam track you want to enter.</h2>
              </div>
            </div>

            <div className="exam-track-tile-grid">
              {examTracks.map((track, index) => (
                <button
                  key={track.title}
                  type="button"
                  className={`exam-track-tile exam-track-tile-${(index % 5) + 1}`}
                  onClick={() => handleExamTrackAccess(track.href)}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="exam-info" className="content-section">
          <div className="home-shell content-layout">
            <article className="content-article">
              <p className="section-tag">How the platform helps</p>
              <h2>Prepare for different exam patterns without jumping across disconnected resources.</h2>
              <p>
                Mathematics aspirants often prepare for more than one exam at the same time. Someone targeting CSIR NET
                may also attempt GATE, state assistant professor recruitment tests, NBHM, or TIFR-style papers
                depending on goals and timelines.
              </p>
              <p>
                That is why this home page is shifting from a single-exam identity to a broader mathematics preparation
                hub. The goal is to keep mocks, PYQs, structured revision, and exam-specific practice flows under one
                roof.
              </p>
              <p>
                The common layer remains the same: practice with discipline, review every mistake carefully, and keep
                improving through repeated attempts instead of scattered study.
              </p>
            </article>

            <aside className="content-aside">
              <h3>Preparation essentials</h3>
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
              <h2>Built to make multi-exam mathematics preparation feel more organized and less scattered.</h2>
              <p>
                This portal is meant for learners who want a simple place to practice regularly, review mistakes, and
                stay close to multiple exam patterns without depending on random disconnected resources.
              </p>
              <p>
                You can later replace this content with your own academic background, mentoring style, institute
                details, or the exact exam mix you want to serve. The structure is already oriented toward a broader
                mathematics-preparation identity.
              </p>
            </div>

            <div className="about-points">
              <div>
                <strong>Multi-exam practice</strong>
                <p>Keep CSIR, GATE, state exams, and institute papers connected in one workflow.</p>
              </div>
              <div>
                <strong>Mocks and PYQs</strong>
                <p>Mix full length tests with past paper preparation as the platform grows.</p>
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
                <strong>Email:</strong> prahallad8280@zohomail.in
              </p>
              <p>
                <strong>Support hours:</strong> Monday to Saturday
              </p>
              <p>
                <strong>Access:</strong> Students can register normally, and admins can manage question banks, mocks,
                and feedback for multiple exam tracks after login.
              </p>
            </div>
          </div>
        </section>

        <section id="feedback" className="feedback-section">
          <div className="home-shell feedback-layout">
            <div className="feedback-copy">
              <p className="section-tag">Feedback</p>
              <h2>Tell us what should improve next on the platform.</h2>
              <p>
                If you notice anything confusing, want a new mock-test feature, or have suggestions about the
                interface, send your feedback here. The message will be submitted directly from the website and stored
                in the admin feedback inbox.
              </p>
              <ul className="info-list">
                <li>Report login or test-access issues.</li>
                <li>Suggest new subjects, past papers, or full length test sets.</li>
                <li>Share ideas to make the platform simpler for students.</li>
              </ul>
            </div>

            <form className="feedback-form-card form-card" onSubmit={handleFeedbackSubmit}>
              <div className="form-card-header">
                <div>
                  <p className="section-tag">Share your thoughts</p>
                  <h3>Send platform feedback</h3>
                </div>
              </div>

              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={feedbackForm.name}
                  onChange={handleFeedbackChange}
                  placeholder="Your name"
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={feedbackForm.email}
                  onChange={handleFeedbackChange}
                  placeholder="Your email"
                />
              </label>

              <label className="field">
                <span>Feedback</span>
                <textarea
                  name="message"
                  rows="5"
                  value={feedbackForm.message}
                  onChange={handleFeedbackChange}
                  placeholder="Write your feedback, bug report, or suggestion here."
                />
              </label>

              {feedbackError ? <p className="form-error">{feedbackError}</p> : null}
              {feedbackSuccess ? <p className="form-success">{feedbackSuccess}</p> : null}

              <button type="submit" className="button" disabled={feedbackSubmitting}>
                {feedbackSubmitting ? "Sending..." : "Send feedback"}
              </button>
            </form>
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
            <button type="button" className="site-nav-button footer-action-button" onClick={handleAuthAction}>
              {user ? "Logout" : "Login/Signup"}
            </button>
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
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

export default LandingPage;
