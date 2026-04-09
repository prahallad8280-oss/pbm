import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import StatCard from "../../components/common/StatCard.jsx";

const optionLabels = ["A", "B", "C", "D"];

const formatDuration = (seconds = 0) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const PublicTestResultPage = () => {
  const { featuredKey } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);

  useEffect(() => {
    if (result) {
      return;
    }

    const storedResult = sessionStorage.getItem(`public-test-result:${featuredKey}`);

    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch (_error) {
        sessionStorage.removeItem(`public-test-result:${featuredKey}`);
      }
    }
  }, [featuredKey, result]);

  if (!result) {
    return <div className="screen-state form-error">Featured result not found.</div>;
  }

  return (
    <div className="page-stack public-test-page">
      <section className="hero-card">
        <div>
          <p className="section-tag">Open sample result</p>
          <h2>{result.category?.name}</h2>
          <p>
            Submitted on {new Date(result.submittedAt).toLocaleString()} after {formatDuration(result.timeTakenSeconds)}.
          </p>
        </div>
        <div className="stats-grid">
          <StatCard label="Score" value={`${result.score}/${result.totalQuestions}`} hint="1 mark per correct answer" />
          <StatCard label="Accuracy" value={`${result.accuracy}%`} hint="Correct answers percentage" />
          <StatCard label="Incorrect" value={result.incorrectCount} hint="Incorrect or skipped questions" />
        </div>
      </section>

      <section className="content-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Detailed solutions</p>
            <h3>Review every question with answer keys and explanations.</h3>
          </div>
        </div>

        <div className="results-list">
          {result.responses.map((response, index) => (
            <article
              key={`${response.questionId}-${index}`}
              className={`review-card ${response.isCorrect ? "correct" : "incorrect"}`}
            >
              <div className="review-header">
                <p className="section-tag">Question {index + 1}</p>
                <span className={`pill ${response.isCorrect ? "" : "pill-danger"}`}>
                  {response.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              <h4>{response.questionText}</h4>

              {response.questionImage ? (
                <div className="review-question-image-wrap">
                  <img src={response.questionImage} alt={`Question ${index + 1} figure`} className="review-question-image" />
                </div>
              ) : null}

              <div className="review-options">
                {response.options.map((option, optionIndex) => (
                  <div
                    key={`${response.questionId}-option-${optionIndex}`}
                    className={`review-option ${
                      optionIndex === response.correctAnswer ? "is-correct" : ""
                    } ${optionIndex === response.selectedAnswer ? "is-selected" : ""}`}
                  >
                    <strong>{optionLabels[optionIndex]}.</strong> {option}
                  </div>
                ))}
              </div>

              <p>
                <strong>Your answer:</strong>{" "}
                {response.selectedAnswer === null || response.selectedAnswer === undefined
                  ? "Not answered"
                  : optionLabels[response.selectedAnswer]}
              </p>
              <p>
                <strong>Correct answer:</strong> {optionLabels[response.correctAnswer]}
              </p>
              <p className="solution-text">
                <strong>Explanation:</strong> {response.explanation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PublicTestResultPage;
