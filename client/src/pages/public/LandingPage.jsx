import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api/client.js";
import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { examTracks } from "../../data/examTracks.js";
import { getWorkspaceLabelForRole, getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const examPointers = [
  "One portal can support preparation for CSIR NET, GATE, Odisha state-level assistant professor exams, NBHM, TIFR, and related mathematics tests.",
  "Different exams need different practice styles, from full length mocks to PYQ-based revision and topic-wise drills.",
  "Preparation improves faster when every exam track still follows the same cycle of practice, review, and correction.",
];

const featuredMathFlts = [
  { year: "2023", session: "June", isOpenSample: true, featuredKey: "mathematics-ma-2023-june" },
  { year: "2023", session: "December" },
  { year: "2024", session: "June" },
  { year: "2024", session: "December" },
  { year: "2025", session: "June" },
  { year: "2025", session: "December" },
];

const normalizeText = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const isExternalLink = (value = "") => /^https?:\/\//i.test(value);

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalClosing, setAuthModalClosing] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [fullLengthCategories, setFullLengthCategories] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

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
    if (!user) {
      setFullLengthCategories([]);
      return undefined;
    }

    let isMounted = true;

    const loadFullLengthCategories = async () => {
      try {
        const { data } = await api.get("/categories", { params: { testType: "flt" } });
        if (isMounted) {
          setFullLengthCategories(data);
        }
      } catch (_error) {
        if (isMounted) {
          setFullLengthCategories([]);
        }
      }
    };

    loadFullLengthCategories();

    return () => {
      isMounted = false;
    };
  }, [user]);

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
    if (!user) {
      return;
    }

    setFeedbackForm((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const handleFeaturedMockAccess = (year, session) => {
    if (!user) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    const matchedCategory = fullLengthCategories.find((category) => {
      const haystack = normalizeText(`${category.name} ${category.slug} ${category.description}`);
      return (
        haystack.includes("math") &&
        haystack.includes(year) &&
        haystack.includes(normalizeText(session))
      );
    });

    if (matchedCategory?._id) {
      navigate(`/tests/start/${matchedCategory._id}`);
      return;
    }

    navigate("/dashboard");
  };

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

  const handleExploreMore = () => {
    if (!user) {
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    navigate("/dashboard");
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
          <div className="home-shell">
            <div className="landing-hero-copy">
              <p className="section-tag">Competitive mathematics preparation portal</p>
              <h1>Mock tests, PYQs, and structured practice for CSIR NET, GATE, Odisha exams, NBHM, TIFR, and more</h1>
              <p className="landing-summary">
                Prepare from one place with full length mocks, topic-wise practice, PYQ-oriented preparation, and
                clear post-test analysis across multiple mathematics exam tracks.
              </p>

              <div className="landing-actions">
                <a href="#exam-info" className="button button-secondary">
                  Explore Platform
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="notice-board-section">
          <div className="home-shell">
            <div className="notification-layout">
              <div className="notification-copy">
                <div className="track-inline-list">
                  <p className="section-tag">Exam tracks</p>
                  {examTracks.map((track) => (
                    <div key={track.title} className="track-inline-item">
                      <div>
                        <h3>{track.title}</h3>
                        <p>{track.description}</p>
                      </div>
                      <button type="button" className="track-inline-link" onClick={() => handleExamTrackAccess(track.href)}>
                        click here
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="notification-panel">
                <h3>Latest notices</h3>

                {notifications.length ? (
                  <ul className="notification-list">
                    {notifications.map((item) => (
                      <li key={item._id} className="notification-list-item">
                        <p className="notification-label">{item.label}</p>
                        <p className="notification-title">{item.title}</p>
                        <p className="notification-body">{item.body}</p>
                        {item.link ? (
                          <button
                            type="button"
                            className="notification-link"
                            onClick={() => handleNotificationClick(item.link)}
                          >
                            Open update
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="notification-empty">Admin notifications will appear here as soon as they are published.</p>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section className="featured-tests-section">
          <div className="home-shell">
            <div className="section-heading">
              <div>
                <p className="section-tag">Featured mathematics series</p>
                <h2>Current full length mock tests for Mathematical Sciences MA from 2023 to 2025.</h2>
              </div>
            </div>

            <div className="featured-tests-grid">
              {featuredMathFlts.map((item) => (
                <article key={`${item.year}-${item.session}`} className="featured-test-card">
                  <p className="featured-test-year">{item.year}</p>
                  <h3>{item.session} Full Length Mock Test</h3>
                  <p>
                    {item.isOpenSample
                      ? "Mathematical Sciences MA open sample test. No login is required for this one."
                      : "Mathematical Sciences MA full length practice set with protected access."}
                  </p>
                  {item.isOpenSample ? (
                    <button
                      type="button"
                      className="button"
                      onClick={() => navigate(`/open-tests/${item.featuredKey}`)}
                    >
                      Start now
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button"
                      onClick={() => handleFeaturedMockAccess(item.year, item.session)}
                    >
                      {user ? "Access mock test" : "Login to access"}
                    </button>
                  )}
                </article>
              ))}
            </div>

            <div className="featured-tests-actions">
              <button type="button" className="button button-secondary" onClick={handleExploreMore}>
                Explore more
              </button>
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
