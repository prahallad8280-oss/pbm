import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../api/client.js";
import ExamAttemptWorkspace from "../../components/tests/ExamAttemptWorkspace.jsx";
import ExamInstructionScreen from "../../components/tests/ExamInstructionScreen.jsx";
import useTimer from "../../hooks/useTimer.js";

const createInitialQuestionState = () => ({
  selectedAnswers: [],
  markedForReview: false,
  visited: false,
});

const getSelectedAnswers = (questionState = {}) =>
  Array.isArray(questionState.selectedAnswers)
    ? questionState.selectedAnswers
    : questionState.selectedAnswer === null || questionState.selectedAnswer === undefined
      ? []
      : [Number(questionState.selectedAnswer)];

const isAnswered = (questionState = {}) => getSelectedAnswers(questionState).length > 0;

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
  const [attemptWarning, setAttemptWarning] = useState("");

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
  const sections = testData?.category?.sections || [];

  const sectionSummaries = useMemo(
    () =>
      sections.map((section) => {
        const sectionQuestions = (testData?.questions || []).filter((question) => question.sectionKey === section.key);
        const attemptedCount = sectionQuestions.filter((question) => isAnswered(questionStates[question.id])).length;

        return {
          ...section,
          attemptedCount,
        };
      }),
    [questionStates, sections, testData],
  );

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

    if (questionState.markedForReview && isAnswered(questionState)) {
      return "answered-review";
    }

    if (questionState.markedForReview) {
      return "review";
    }

    if (isAnswered(questionState)) {
      return "answered";
    }

    return "not-answered";
  };

  const moveToQuestion = (nextIndex) => {
    if (!testData?.questions?.length) {
      return;
    }

    const boundedIndex = Math.min(Math.max(nextIndex, 0), testData.questions.length - 1);
    setAttemptWarning("");
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
    const currentQuestion = testData.questions.find((question) => question.id === questionId);
    const sectionRule = sections.find((section) => section.key === currentQuestion?.sectionKey);

    updateQuestionState(questionId, (current) => {
      const selectedAnswers = getSelectedAnswers(current);
      const alreadyAnswered = selectedAnswers.length > 0;
      const alreadySelected = selectedAnswers.includes(optionIndex);
      const nextSelectedAnswers =
        currentQuestion?.questionFormat === "msq"
          ? alreadySelected
            ? selectedAnswers.filter((value) => value !== optionIndex)
            : [...selectedAnswers, optionIndex].sort((left, right) => left - right)
          : alreadySelected
            ? []
            : [optionIndex];

      if (!alreadyAnswered && nextSelectedAnswers.length && sectionRule) {
        const attemptedCount =
          sectionSummaries.find((section) => section.key === sectionRule.key)?.attemptedCount || 0;

        if (attemptedCount >= sectionRule.attemptLimit) {
          setAttemptWarning(`You can attempt only ${sectionRule.attemptLimit} questions in ${sectionRule.title}.`);
          return {
            ...current,
            visited: true,
          };
        }
      }

      setAttemptWarning("");

      return {
        ...current,
        selectedAnswers: nextSelectedAnswers,
        visited: true,
      };
    });
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
      selectedAnswers: [],
      visited: true,
    }));
    setAttemptWarning("");
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
          selectedAnswers: getSelectedAnswers(questionStates[question.id]),
          selectedAnswer: getSelectedAnswers(questionStates[question.id])[0] ?? null,
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
      sections={sections}
      questions={testData.questions}
      currentIndex={currentIndex}
      currentSectionKey={testData.questions[currentIndex]?.sectionKey || sections[0]?.key}
      sectionSummaries={sectionSummaries}
      questionStates={questionStates}
      secondsLeft={secondsLeft}
      paletteCollapsed={paletteCollapsed}
      onTogglePalette={() => setPaletteCollapsed((current) => !current)}
      onJumpToSection={(sectionKey) => {
        const nextIndex = testData.questions.findIndex((question) => question.sectionKey === sectionKey);
        if (nextIndex >= 0) {
          moveToQuestion(nextIndex);
        }
      }}
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
      attemptWarning={attemptWarning}
      getQuestionStatus={getQuestionStatus}
    />
  );
};

export default PublicTestAttemptPage;
