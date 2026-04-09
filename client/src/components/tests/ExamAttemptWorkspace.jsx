const formatClock = (seconds = 0) => {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const remainingSeconds = String(safeSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remainingSeconds}`;
};

const optionLabels = ["1", "2", "3", "4"];

const ExamAttemptWorkspace = ({
  candidateName,
  category,
  questions,
  currentIndex,
  questionStates,
  secondsLeft,
  paletteCollapsed,
  onTogglePalette,
  onJumpToQuestion,
  onSelectAnswer,
  onClearResponse,
  onSaveNext,
  onSaveMarkForReview,
  onMarkForReviewNext,
  onPrevious,
  onNext,
  onSubmit,
  submitting = false,
  getQuestionStatus,
}) => {
  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentQuestion.id] || {};
  const statusCounts = questions.reduce(
    (counts, question) => {
      counts[getQuestionStatus(question.id)] += 1;
      return counts;
    },
    {
      "not-visited": 0,
      "not-answered": 0,
      answered: 0,
      review: 0,
      "answered-review": 0,
    },
  );

  return (
    <div className="exam-page exam-attempt-page">
      <header className="exam-workspace-header">
        <div className="exam-header-branding">
          <div className="exam-header-logo">NTA</div>
          <div className="exam-header-copy">
            <strong>{category.examName || "CSIR"}</strong>
            <span>{category.subjectLabel || category.name}</span>
          </div>
        </div>

        <div className="exam-header-language">
          <span>English</span>
        </div>
      </header>

      <section className="exam-candidate-strip">
        <div className="exam-profile-avatar">{candidateName?.slice(0, 1) || "C"}</div>
        <div className="exam-candidate-meta">
          <p>
            <strong>Candidate Name:</strong> {candidateName}
          </p>
          <p>
            <strong>Exam Name:</strong> {category.examName || "CSIR"}
          </p>
          <p>
            <strong>Subject Name:</strong> {category.subjectLabel || category.name}
          </p>
          <p>
            <strong>Remaining Time:</strong> <span className="exam-time-pill">{formatClock(secondsLeft)}</span>
          </p>
        </div>
      </section>

      <div className={`exam-workspace ${paletteCollapsed ? "palette-collapsed" : ""}`}>
        <main className="exam-question-panel">
          <div className="exam-section-tab">{category.subjectLabel || category.name}</div>

          <div className="exam-question-box">
            <div className="exam-question-header">
              <h2>Question {currentIndex + 1}:</h2>
            </div>

            <div className="exam-question-body">
              <p className="exam-question-text">{currentQuestion.questionText}</p>

              <div className="exam-options-grid">
                {currentQuestion.options.map((option, optionIndex) => {
                  const isSelected = currentState.selectedAnswer === optionIndex;

                  return (
                    <button
                      key={`${currentQuestion.id}-${optionIndex}`}
                      type="button"
                      className={`exam-option ${isSelected ? "selected" : ""}`}
                      onClick={() => onSelectAnswer(currentQuestion.id, optionIndex)}
                    >
                      <span>{optionLabels[optionIndex]})</span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="exam-primary-actions">
              <button type="button" className="exam-action-button save" onClick={onSaveNext}>
                Save & Next
              </button>
              <button type="button" className="exam-action-button clear" onClick={onClearResponse}>
                Clear Response
              </button>
              <button type="button" className="exam-action-button review-save" onClick={onSaveMarkForReview}>
                Save & Mark for Review
              </button>
              <button type="button" className="exam-action-button review" onClick={onMarkForReviewNext}>
                Mark for Review & Next
              </button>
            </div>

            <div className="exam-secondary-actions">
              <button type="button" className="exam-nav-button" onClick={onPrevious} disabled={currentIndex === 0}>
                &lt;&lt; Back
              </button>
              <button
                type="button"
                className="exam-nav-button"
                onClick={onNext}
                disabled={currentIndex === questions.length - 1}
              >
                Next &gt;&gt;
              </button>
              <button type="button" className="exam-submit-button" onClick={onSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </main>

        <aside className="exam-palette-panel">
          <button type="button" className="exam-palette-toggle" onClick={onTogglePalette} aria-label="Toggle palette">
            {paletteCollapsed ? "<" : ">"}
          </button>

          {!paletteCollapsed ? (
            <>
              <div className="exam-palette-legend">
                <div className="legend-count-row">
                  <span className="instruction-legend-badge not-visited">{statusCounts["not-visited"]}</span>
                  <span>Not Visited</span>
                </div>
                <div className="legend-count-row">
                  <span className="instruction-legend-badge not-answered">{statusCounts["not-answered"]}</span>
                  <span>Not Answered</span>
                </div>
                <div className="legend-count-row">
                  <span className="instruction-legend-badge answered">{statusCounts.answered}</span>
                  <span>Answered</span>
                </div>
                <div className="legend-count-row">
                  <span className="instruction-legend-badge review">{statusCounts.review}</span>
                  <span>Marked for Review</span>
                </div>
                <div className="legend-count-row wide">
                  <span className="instruction-legend-badge answered-review">{statusCounts["answered-review"]}</span>
                  <span>Answered & Marked for Review</span>
                </div>
              </div>

              <div className="exam-palette-grid">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    className={`exam-palette-button ${getQuestionStatus(question.id)} ${
                      currentIndex === index ? "current" : ""
                    }`}
                    onClick={() => onJumpToQuestion(index)}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
};

export default ExamAttemptWorkspace;
