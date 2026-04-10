import { buildInstructionSections, instructionConsentText, instructionLegendItems } from "./examInstructions.js";

const ExamInstructionScreen = ({
  category,
  consentAccepted,
  onConsentChange,
  onProceed,
  proceeding = false,
  showWarning = false,
  onCloseWarning,
}) => {
  const sections = buildInstructionSections({
    examName: category?.examName,
    subjectLabel: category?.subjectLabel || category?.name,
    durationMinutes: category?.durationMinutes,
  });
  const sectionRules = category?.sections || [];

  return (
    <div className="exam-page">
      <div className="exam-instructions-shell">
        <div className="exam-instructions-card">
          <h1>Please read the instructions carefully</h1>

          {sections.map((section) => (
            <section key={section.title} className="instruction-section">
              <h2>{section.title}:</h2>
              <ol>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>

              {section.title === "General Instructions" ? (
                <div className="instruction-legend-list">
                  {instructionLegendItems.map((item) => (
                    <div key={item.key} className="instruction-legend-row">
                      <span className={`instruction-legend-badge ${item.key}`} />
                      <p>{item.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ))}

          {sectionRules.length ? (
            <section className="instruction-section">
              <h2>Section pattern:</h2>
              <div className="instruction-section-table">
                <div className="instruction-section-row instruction-section-row-head">
                  <span>Section</span>
                  <span>Format</span>
                  <span>Attempt</span>
                  <span>Marks</span>
                </div>
                {sectionRules.map((section) => (
                  <div key={section.key} className="instruction-section-row">
                    <span>{section.title}</span>
                    <span>{section.questionType.toUpperCase()}</span>
                    <span>
                      {section.attemptLimit}/{section.questionCount}
                    </span>
                    <span>{section.marksPerQuestion}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <label className="instruction-consent">
            <input type="checkbox" checked={consentAccepted} onChange={(event) => onConsentChange(event.target.checked)} />
            <span>{instructionConsentText}</span>
          </label>

          <div className="instruction-actions">
            <button type="button" className="exam-proceed-button" onClick={onProceed} disabled={proceeding}>
              {proceeding ? "Opening test..." : "Proceed"}
            </button>
          </div>
        </div>
      </div>

      {showWarning ? (
        <div className="instruction-warning-overlay">
          <div className="instruction-warning-card">
            <div className="instruction-warning-icon">!</div>
            <h3>Warning!</h3>
            <p>Please accept terms and conditions before proceeding.</p>
            <button type="button" className="button" onClick={onCloseWarning}>
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ExamInstructionScreen;

