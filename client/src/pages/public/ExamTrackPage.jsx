import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import api from "../../api/client.js";
import LoginForm from "../../components/auth/LoginForm.jsx";
import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { getExamTrackBySlug } from "../../data/examTracks.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getWorkspaceLabelForRole, getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const ExamTrackPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalClosing, setAuthModalClosing] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [trackBoards, setTrackBoards] = useState([]);
  const [expandedBoardId, setExpandedBoardId] = useState(null);

  const track = getExamTrackBySlug(slug);
  const deepDive = track?.deepDive;

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
    if (!track) {
      return;
    }

    let isMounted = true;

    const loadTrackBoards = async () => {
      try {
        const { data } = await api.get("/track-boards", {
          params: { track: track.slug },
        });

        if (isMounted) {
          setTrackBoards(data);
          setExpandedBoardId(data[0]?._id || null);
        }
      } catch (_error) {
        if (isMounted) {
          setTrackBoards([]);
          setExpandedBoardId(null);
        }
      }
    };

    loadTrackBoards();

    return () => {
      isMounted = false;
    };
  }, [track]);

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

  const handleBoardLink = (link) => {
    const target = String(link || "").trim();

    if (!target) {
      return;
    }

    if (/^https?:\/\//i.test(target)) {
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(target);
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
              {(deepDive?.overview || track.details).map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>

            <aside className="track-detail-aside">
              <p className="section-tag">{deepDive ? "Why choose this exam" : "Focus areas"}</p>
              <ul className="info-list">
                {(deepDive?.whyChoose || track.highlights).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {trackBoards.length ? (
          <section className="track-resource-section">
            <div className="home-shell">
              <p className="section-tag">Mock tests and PYQs</p>
              <h2 className="track-section-title">Open the section you want, then choose the related material.</h2>

              <div className="track-board-list">
                {trackBoards.map((board, index) => {
                  const isOpen = expandedBoardId === board._id;

                  return (
                    <div key={board._id} className="track-board-card">
                      <button
                        type="button"
                        className={`track-board-button track-board-button-${(index % 5) + 1} ${isOpen ? "is-open" : ""}`}
                        onClick={() => setExpandedBoardId((current) => (current === board._id ? null : board._id))}
                      >
                        <span>{board.title}</span>
                        <span className="track-board-toggle">{isOpen ? "-" : "+"}</span>
                      </button>

                      {isOpen ? (
                        <div className="track-board-panel">
                          <div className="track-board-item-list">
                            {board.items.map((item) => (
                              <button
                                key={`${board._id}-${item.title}`}
                                type="button"
                                className="track-board-item"
                                onClick={() => handleBoardLink(item.link)}
                              >
                                <span>{item.title}</span>
                                <span className="track-board-item-icon">&#8599;</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {deepDive ? (
          <>
            <section className="track-resource-section">
              <div className="home-shell">
                <p className="section-tag">Exam structure</p>
                <h2 className="track-section-title">Pattern, marks, and duration</h2>

                <div className="track-structure-meta">
                  <p>
                    <strong>Duration:</strong> {deepDive.examStructure.duration}
                  </p>
                  {deepDive.examStructure.notes.map((note) => (
                    <p key={note}>
                      <strong>Note:</strong> {note}
                    </p>
                  ))}
                </div>

                <div className="track-table-wrap">
                  <table className="track-structure-table">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th>Nature of Questions</th>
                        <th>Attempt</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deepDive.examStructure.rows.map((row) => (
                        <tr key={row.section}>
                          <td>{row.section}</td>
                          <td>{row.nature || "-"}</td>
                          <td>{row.attempt || "-"}</td>
                          <td>{row.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="track-resource-section track-rich-alt-section">
              <div className="home-shell">
                <p className="section-tag">Syllabus breakdown</p>
                <h2 className="track-section-title">Mathematical Sciences syllabus</h2>
                <p className="track-page-summary track-inline-summary">{deepDive.syllabusIntro}</p>

                <div className="track-syllabus-list">
                  {deepDive.syllabusUnits.map((unit) => (
                    <article key={unit.title} className="track-unit-block">
                      <h3>{unit.title}</h3>
                      <div className="track-subtopic-list">
                        {unit.groups.map((group) => (
                          <div key={`${unit.title}-${group.label}`} className="track-subtopic-block">
                            <h4>{group.label}</h4>
                            <ul className="track-plain-list">
                              {group.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="track-resource-section">
              <div className="home-shell track-dual-section">
                <div>
                  <p className="section-tag">Who should prepare</p>
                  <h2 className="track-section-title">Best fit for this exam track</h2>
                  <ul className="track-plain-list">
                    {deepDive.whoShouldPrepare.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="section-tag">Eligibility criteria</p>
                  <h2 className="track-section-title">Qualification and age rules</h2>

                  <div className="track-eligibility-block">
                    <h3>{deepDive.eligibility.educationTitle}</h3>
                    <ul className="track-plain-list">
                      {deepDive.eligibility.education.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="track-eligibility-block">
                    <h3>{deepDive.eligibility.ageTitle}</h3>
                    <ul className="track-plain-list">
                      {deepDive.eligibility.age.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="track-resource-section track-rich-alt-section">
              <div className="home-shell">
                <p className="section-tag">Important note</p>
                <h2 className="track-section-title">What to keep in mind while preparing</h2>
                <ul className="track-plain-list">
                  {deepDive.importantNotes.map((item) => (
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
          </>
        ) : (
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
        )}
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
