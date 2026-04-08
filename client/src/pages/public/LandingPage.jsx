import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../api/client.js";
import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const examPointers = [
  "CSIR NET is conducted for Junior Research Fellowship and eligibility for lectureship or assistant professor roles in science streams.",
  "Preparation works best when concept revision is paired with timed mock practice and honest review of mistakes.",
  "This portal is designed to help aspirants practice subject-wise tests as well as full length tests from one place.",
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

        <section className="featured-tests-section">
          <div className="home-shell">
            <div className="section-heading">
              <div>
                <p className="section-tag">Mathematical Sciences MA</p>
                <h2>Full length mock tests for June and December sessions from 2023 to 2025.</h2>
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
                <strong>Email:</strong> prahallad8280@zohomail.in
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

        <section id="feedback" className="feedback-section">
          <div className="home-shell feedback-layout">
            <div className="feedback-copy">
              <p className="section-tag">Feedback</p>
              <h2>Tell us what should improve next on the platform.</h2>
              <p>
                If you notice anything confusing, want a new mock-test feature, or have suggestions about the
                interface, send your feedback here. The message will be submitted directly from the website and sent
                to the platform inbox.
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
            <p className="section-tag">CSIR NET Mock Test</p>
            <h3>Practice regularly, review carefully, and improve with every attempt.</h3>
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
