import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import api from "../../api/client.js";
import MathText from "../../components/common/MathText.jsx";

const optionLabels = ["A", "B", "C", "D"];
const formatAnswerLabels = (answers = []) =>
  Array.isArray(answers) && answers.length ? answers.map((value) => optionLabels[value]).join(", ") : "Not answered";

const formatDuration = (seconds = 0) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const TestResultPage = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState("");

  useEffect(() => {
    if (result) {
      return;
    }

    const loadResult = async () => {
      try {
        const { data } = await api.get(`/tests/attempts/${attemptId}`);
        setResult(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load the attempt report.");
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId, result]);

  if (loading) {
    return <div className="screen-state">Loading result...</div>;
  }

  if (error || !result) {
    return <div className="screen-state form-error">{error || "Result not found."}</div>;
  }

  return (
    <div className="page-stack">
      <section className="workspace-intro">
        <p className="section-tag">Result summary</p>
        <h2>{result.category?.name}</h2>
        <p className="workspace-lead">
          Submitted on {new Date(result.submittedAt).toLocaleString()} after {formatDuration(result.timeTakenSeconds)}.
        </p>
      </section>

      <section className="metric-strip">
        <article className="metric-item">
          <span>Score</span>
          <strong>
            {result.score}/{result.totalMarks}
          </strong>
          <p>Marks earned against the total attemptable marks.</p>
        </article>
        <article className="metric-item">
          <span>Accuracy</span>
          <strong>{result.accuracy}%</strong>
          <p>Correct answers out of attempted questions.</p>
        </article>
        <article className="metric-item">
          <span>Attempted</span>
          <strong>
            {result.attemptedCount}/{result.category?.attemptableCount || result.totalQuestions}
          </strong>
          <p>Attempted questions against the allowed limit.</p>
        </article>
        <article className="metric-item">
          <span>Unanswered</span>
          <strong>{result.unansweredCount}</strong>
          <p>Questions left unanswered.</p>
        </article>
      </section>

      {result.sectionSummaries?.length ? (
        <section className="workspace-section">
          <div className="section-headline">
            <div>
              <p className="section-tag">Section summary</p>
              <h3>Part-wise score and attempt usage.</h3>
            </div>
          </div>

          <div className="test-line-list">
            {result.sectionSummaries.map((section) => (
              <article key={section.key} className="test-line-item">
                <div>
                  <p className={`pill ${section.questionType === "msq" ? "pill-alt" : ""}`}>
                    {section.questionType.toUpperCase()}
                  </p>
                  <h4>{section.title}</h4>
                  <p className="test-line-meta">
                    Attempt {section.attemptedCount}/{section.attemptLimit} | Correct {section.correctCount} | Incorrect{" "}
                    {section.incorrectCount} | Unanswered {section.unansweredCount}
                  </p>
                </div>

                <p className="workspace-meta">
                  {section.score}/{section.totalMarks} marks
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="workspace-section">
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

              <h4>
                <MathText inline text={response.questionText} />
              </h4>
              <p className="workspace-meta">
                {response.sectionTitle} | {String(response.questionFormat || "mcq").toUpperCase()} |{" "}
                {response.marksPerQuestion} marks
              </p>

              {response.questionImage ? (
                <div className="review-question-image-wrap">
                  <img
                    src={response.questionImage}
                    alt={`Question ${index + 1} figure`}
                    className="review-question-image"
                  />
                </div>
              ) : null}

              <div className="review-options">
                {response.options.map((option, optionIndex) => (
                  <div
                    key={`${response.questionId}-option-${optionIndex}`}
                    className={`review-option ${
                      response.correctAnswers?.includes(optionIndex) ? "is-correct" : ""
                    } ${response.selectedAnswers?.includes(optionIndex) ? "is-selected" : ""}`}
                  >
                    <strong>{optionLabels[optionIndex]}.</strong> <MathText inline text={option} />
                  </div>
                ))}
              </div>

              <p>
                <strong>Your answer:</strong> {formatAnswerLabels(response.selectedAnswers)}
              </p>
              <p>
                <strong>Correct answer:</strong> {formatAnswerLabels(response.correctAnswers)}
              </p>
              <p>
                <strong>Marks awarded:</strong> {response.marksAwarded}/{response.marksPerQuestion}
              </p>
              {String(response.explanation || "").trim() ? (
                <p className="solution-text">
                  <strong>Explanation:</strong> <MathText inline text={response.explanation} />
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TestResultPage;
