import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const examHighlights = [
  {
    title: "What is CSIR NET?",
    text: "CSIR NET is a national-level eligibility exam for Junior Research Fellowship and Lectureship in core science disciplines.",
  },
  {
    title: "How should you prepare?",
    text: "Strong preparation needs concept revision, timed problem solving, and regular analysis of mistakes across aptitude and subject topics.",
  },
  {
    title: "How this portal helps",
    text: "Practice subject-wise tests and full-length mock exams with timers, instant scoring, explanations, and attempt tracking.",
  },
];

const examFacts = [
  { label: "Practice mode", value: "Subject + FLT" },
  { label: "Question style", value: "MCQ with timer" },
  { label: "Review support", value: "Detailed solutions" },
];

const examFocus = [
  "Build daily consistency with short, focused test sessions.",
  "Improve speed and accuracy before the real exam window.",
  "Review explanations after each test to learn from mistakes.",
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <header className="site-header">
        <Link to="/" className="site-brand">
          <span className="site-brand-mark">CSIR</span>
          <div>
            <p>Mock Test Portal</p>
            <span>Practice with structure and feedback</span>
          </div>
        </Link>

        <nav className="site-nav">
          <a href="#about">About Me</a>
          <a href="#contact">Contact</a>
          <Link to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} className="button">
            {user ? "Open Dashboard" : "Login"}
          </Link>
        </nav>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <div className="hero-copy">
            <p className="section-tag">CSIR NET mock test platform</p>
            <h1>Practice the exam with better rhythm, clearer feedback, and less guesswork.</h1>
            <p className="hero-lead">
              Use guided mock tests to prepare for CSIR NET with timed practice, subject-wise revision, and full
              length test readiness from one clean dashboard.
            </p>

            <div className="hero-actions">
              <Link to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} className="button">
                {user ? "Continue Practice" : "Login to Start"}
              </Link>
              <a href="#exam-info" className="button button-secondary">
                Explore Exam Info
              </a>
            </div>
          </div>

          <aside className="hero-panel">
            <p className="section-tag">Quick snapshot</p>
            <div className="hero-fact-list">
              {examFacts.map((fact) => (
                <article key={fact.label} className="hero-fact-card">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section id="exam-info" className="home-section">
          <div className="section-heading">
            <div>
              <p className="section-tag">Exam information</p>
              <h2>Start with the right picture of the exam.</h2>
            </div>
            <p className="muted-text">
              A good mock platform is most useful when it reflects the way aspirants actually revise, solve, and
              review.
            </p>
          </div>

          <div className="home-card-grid">
            {examHighlights.map((item) => (
              <article key={item.title} className="home-info-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="home-banner">
            <div>
              <p className="section-tag">Preparation focus</p>
              <h3>What serious practice should help you improve</h3>
            </div>

            <div className="focus-points">
              {examFocus.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="section-heading">
            <div>
              <p className="section-tag">About Me</p>
              <h2>Why this platform exists</h2>
            </div>
          </div>

          <div className="about-panel">
            <div className="about-copy">
              <p>
                I created this portal to make CSIR NET preparation more organized for learners who want regular mock
                practice without jumping between scattered resources.
              </p>
              <p>
                The goal is simple: help aspirants revise topics, test themselves under time pressure, and understand
                every mistake through clear explanations and attempt history.
              </p>
            </div>

            <div className="about-note">
              <p className="section-tag">Built for learners</p>
              <h3>Focused on consistency, clarity, and confidence.</h3>
              <p>
                You can later replace this section with your own personal introduction, institute profile, or teaching
                mission.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="home-section">
          <div className="section-heading">
            <div>
              <p className="section-tag">Contact</p>
              <h2>Reach out for support, collaboration, or exam guidance.</h2>
            </div>
          </div>

          <div className="contact-grid">
            <article className="contact-card">
              <p className="section-tag">Email</p>
              <h3>contact@csirmocktest.com</h3>
              <p>Use this area for your support or business email address.</p>
            </article>

            <article className="contact-card">
              <p className="section-tag">Availability</p>
              <h3>Mon to Sat</h3>
              <p>Respond to student queries, account help, and question updates during your working hours.</p>
            </article>

            <article className="contact-card">
              <p className="section-tag">Need access?</p>
              <h3>Login or register</h3>
              <p>Students can create an account, and admins can manage the question bank from the protected panel.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <p className="section-tag">CSIR NET Mock Test</p>
          <h3>Practice smart. Review honestly. Improve steadily.</h3>
        </div>

        <div className="footer-links">
          <a href="#about">About Me</a>
          <a href="#contact">Contact</a>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
