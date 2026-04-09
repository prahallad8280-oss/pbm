import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/client.js";
import ExamAttemptWorkspace from "../../components/tests/ExamAttemptWorkspace.jsx";
import ExamInstructionScreen from "../../components/tests/ExamInstructionScreen.jsx";
import useTimer from "../../hooks/useTimer.js";

const createInitialQuestionState = () => ({
  selectedAnswer: null,
  markedForReview: false,
  visited: false,
});

const PublicTestAttemptPage = () => {
  const navigate = useNavigate();
  const { featuredKey } = useParams();
  const [testData, setTestData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState({});
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const loadPublicTest = async () => {
      try {
        const { data } = await api.get(`/tests/public/featured/${featuredKey}`);
        setTestData(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to open the featured mock test.");
      }
    };

    loadPublicTest();
  }, [featuredKey]);

  useEffect(() => {
    if (!hasStarted || !testData?.questions?.length) {
      return;
    }

    setQuestionStates((current) => {
      const nextState = { ...current };

      testData.questions.forEach((question) => {
        nextState[question.id] = nextState[question.id] || createInitialQuestionState();
      });

      const firstQuestionId = testData.questions[0]?.id;

      if (firstQuestionId) {
        nextState[firstQuestionId] = {
          ...nextState[firstQuestionId],
          visited: true,
        };
      }

      return nextState;
    });
  }, [hasStarted, testData]);

  useEffect(() => {
    if (!hasStarted || !testData?.questions?.length) {
      return;
    }

    const currentQuestion = testData.questions[currentIndex];

    if (!currentQuestion) {
      return;
    }

    setQuestionStates((current) => ({
      ...current,
      [currentQuestion.id]: {
        ...(current[currentQuestion.id] || createInitialQuestionState()),
        visited: true,
      },
    }));
  }, [currentIndex, hasStarted, testData]);

  const totalSeconds = (testData?.durationMinutes || 0) * 60;

  const handleProceed = async () => {
    if (!consentAccepted) {
      setShowConsentWarning(true);
      return;
    }

    setStarting(true);
    setHasStarted(true);
    setCurrentIndex(0);
    setStarting(false);
  };

  const getQuestionStatus = (questionId) => {
    const questionState = questionStates[questionId] || createInitialQuestionState();

    if (!questionState.visited) {
      return "not-visited";
    }

    if (questionState.markedForReview && questionState.selectedAnswer !== null) {
      return "answered-review";
    }

    if (questionState.markedForReview) {
      return "review";
    }

    if (questionState.selectedAnswer !== null) {
      return "answered";
    }

    return "not-answered";
  };

  const moveToQuestion = (nextIndex) => {
    if (!testData?.questions?.length) {
      return;
    }

    const boundedIndex = Math.min(Math.max(nextIndex, 0), testData.questions.length - 1);
    setCurrentIndex(boundedIndex);
  };

  const updateQuestionState = (questionId, updater) => {
    setQuestionStates((current) => {
      const previousState = current[questionId] || createInitialQuestionState();

      return {
        ...current,
        [questionId]: updater(previousState),
      };
    });
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    updateQuestionState(questionId, (current) => ({
      ...current,
      selectedAnswer: current.selectedAnswer === optionIndex ? null : optionIndex,
      visited: true,
    }));
  };

  const handleSaveNext = () => {
    const questionId = testData.questions[currentIndex].id;
    updateQuestionState(questionId, (current) => ({
      ...current,
      markedForReview: false,
      visited: true,
    }));
    moveToQuestion(currentIndex + 1);
  };

  const handleSaveMarkForReview = () => {
    const questionId = testData.questions[currentIndex].id;
    updateQuestionState(questionId, (current) => ({
      ...current,
      markedForReview: true,
      visited: true,
    }));
  };

  const handleMarkForReviewNext = () => {
    const questionId = testData.questions[currentIndex].id;
    updateQuestionState(questionId, (current) => ({
      ...current,
      markedForReview: true,
      visited: true,
    }));
    moveToQuestion(currentIndex + 1);
  };

  const handleClearResponse = () => {
    const questionId = testData.questions[currentIndex].id;
    updateQuestionState(questionId, (current) => ({
      ...current,
      selectedAnswer: null,
      visited: true,
    }));
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (!testData || submitting) {
      return;
    }

    if (!forceSubmit && !window.confirm("Submit this test now?")) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        sessionToken: testData.sessionToken,
        responses: testData.questions.map((question) => ({
          questionId: question.id,
          selectedAnswer:
            questionStates[question.id]?.selectedAnswer === undefined ||
            questionStates[question.id]?.selectedAnswer === null
              ? null
              : Number(questionStates[question.id].selectedAnswer),
        })),
        timeTakenSeconds: totalSeconds - secondsLeft,
      };

      const { data } = await api.post(`/tests/public/featured/${featuredKey}/submit`, payload);
      sessionStorage.setItem(`public-test-result:${featuredKey}`, JSON.stringify(data));
      navigate(`/open-tests/${featuredKey}/result`, { replace: true, state: { result: data } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to submit your featured test.");
      setSubmitting(false);
    }
  };

  const { isReady, secondsLeft } = useTimer(hasStarted ? totalSeconds : 0, () => handleSubmit(true));

  if (error && !testData) {
    return <div className="screen-state form-error">{error}</div>;
  }

  if (!testData) {
    return <div className="screen-state">Loading featured test instructions...</div>;
  }

  if (!hasStarted) {
    return (
      <ExamInstructionScreen
        category={testData.category}
        consentAccepted={consentAccepted}
        onConsentChange={setConsentAccepted}
        onProceed={handleProceed}
        proceeding={starting}
        showWarning={showConsentWarning}
        onCloseWarning={() => setShowConsentWarning(false)}
      />
    );
  }

  if (!isReady) {
    return <div className="screen-state">Preparing the featured mock test...</div>;
  }

  return (
    <ExamAttemptWorkspace
      candidateName="Demo Candidate"
      category={testData.category}
      questions={testData.questions}
      currentIndex={currentIndex}
      questionStates={questionStates}
      secondsLeft={secondsLeft}
      paletteCollapsed={paletteCollapsed}
      onTogglePalette={() => setPaletteCollapsed((current) => !current)}
      onJumpToQuestion={moveToQuestion}
      onSelectAnswer={handleSelectAnswer}
      onClearResponse={handleClearResponse}
      onSaveNext={handleSaveNext}
      onSaveMarkForReview={handleSaveMarkForReview}
      onMarkForReviewNext={handleMarkForReviewNext}
      onPrevious={() => moveToQuestion(currentIndex - 1)}
      onNext={() => moveToQuestion(currentIndex + 1)}
      onSubmit={() => handleSubmit()}
      submitting={submitting}
      getQuestionStatus={getQuestionStatus}
    />
  );
};

export default PublicTestAttemptPage;
