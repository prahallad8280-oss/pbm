import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/client.js";
import QuestionCard from "../../components/tests/QuestionCard.jsx";
import TimerBar from "../../components/tests/TimerBar.jsx";
import useTimer from "../../hooks/useTimer.js";

const PublicTestAttemptPage = () => {
  const navigate = useNavigate();
  const { featuredKey } = useParams();
  const [testData, setTestData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const startedRef = useRef(false);
  const submitRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    const startPublicAttempt = async () => {
      try {
        const { data } = await api.get(`/tests/public/featured/${featuredKey}`);
        setTestData(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to open the featured mock test.");
      }
    };

    startPublicAttempt();
  }, [featuredKey]);

  const totalSeconds = (testData?.durationMinutes || 0) * 60;

  const handleSubmit = async (forceSubmit = false) => {
    if (!testData || submitRef.current) {
      return;
    }

    if (!forceSubmit && !window.confirm("Submit this test now?")) {
      return;
    }

    submitRef.current = true;
    setSubmitting(true);

    try {
      const payload = {
        sessionToken: testData.sessionToken,
        responses: testData.questions.map((question) => ({
          questionId: question.id,
          selectedAnswer:
            answers[question.id] === undefined || answers[question.id] === null ? null : Number(answers[question.id]),
        })),
        timeTakenSeconds: totalSeconds - secondsLeft,
      };

      const { data } = await api.post(`/tests/public/featured/${featuredKey}/submit`, payload);
      sessionStorage.setItem(`public-test-result:${featuredKey}`, JSON.stringify(data));
      navigate(`/open-tests/${featuredKey}/result`, { replace: true, state: { result: data } });
    } catch (requestError) {
      submitRef.current = false;
      setError(requestError.response?.data?.message || "Failed to submit your featured test.");
      setSubmitting(false);
    }
  };

  const { progress, secondsLeft } = useTimer(totalSeconds, () => handleSubmit(true));
  const question = testData?.questions[currentIndex];

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== undefined && value !== null).length,
    [answers],
  );

  if (error && !testData) {
    return <div className="screen-state form-error">{error}</div>;
  }

  if (!testData || !question) {
    return <div className="screen-state">Preparing the featured mock test...</div>;
  }

  return (
    <div className="page-stack public-test-page">
      <section className="hero-card">
        <div>
          <p className="section-tag">Open sample test</p>
          <h2>{testData.category.name}</h2>
          <p>{testData.category.description}</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card compact">
            <p>Answered</p>
            <h3>
              {answeredCount}/{testData.questions.length}
            </h3>
          </div>
          <div className="stat-card compact">
            <p>Question bank</p>
            <h3>{testData.questions.length}</h3>
          </div>
        </div>
      </section>

      <TimerBar secondsLeft={secondsLeft} progress={progress} />

      {error ? <p className="form-error">{error}</p> : null}

      <QuestionCard
        question={question}
        index={currentIndex}
        total={testData.questions.length}
        selectedAnswer={answers[question.id]}
        onSelect={(selectedAnswer) =>
          setAnswers((current) => ({
            ...current,
            [question.id]: selectedAnswer,
          }))
        }
      />

      <section className="navigation-card">
        <div className="question-jump-grid">
          {testData.questions.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`question-jump ${currentIndex === index ? "active" : ""} ${
                answers[item.id] !== undefined ? "answered" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setCurrentIndex((current) => Math.max(current - 1, 0))}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          <button
            type="button"
            className="button button-secondary"
            onClick={() => setCurrentIndex((current) => Math.min(current + 1, testData.questions.length - 1))}
            disabled={currentIndex === testData.questions.length - 1}
          >
            Next
          </button>

          <button type="button" className="button" onClick={() => handleSubmit()} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit test"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default PublicTestAttemptPage;
