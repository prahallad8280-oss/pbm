import { Link } from "react-router-dom";

const examPointers = [
  "CSIR NET is conducted for Junior Research Fellowship and eligibility for lectureship or assistant professor roles in science streams.",
  "Preparation works best when concept revision is paired with timed mock practice and honest review of mistakes.",
  "This portal is designed to help aspirants practice subject-wise tests as well as full length tests from one place.",
];

const HomePage = () => (
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
            <Link to="/login">Login</Link>
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
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
);

export default HomePage;
