export const shuffleArray = (items = []) => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

export const sanitizeQuestion = (question) => ({
  id: question._id,
  questionText: question.questionText,
  options: question.options,
  testType: question.testType,
});

export const formatAttemptForClient = (attempt) => ({
  id: attempt._id,
  status: attempt.status,
  testType: attempt.testType,
  startedAt: attempt.startedAt,
  submittedAt: attempt.submittedAt,
  timeTakenSeconds: attempt.timeTakenSeconds,
  totalQuestions: attempt.totalQuestions,
  correctCount: attempt.correctCount,
  incorrectCount: attempt.incorrectCount,
  accuracy: attempt.accuracy,
  score: attempt.score,
  category: attempt.category
    ? {
        id: attempt.category._id,
        name: attempt.category.name,
        slug: attempt.category.slug,
        description: attempt.category.description,
        examName: attempt.category.examName,
        subjectLabel: attempt.category.subjectLabel,
        testType: attempt.category.testType,
        durationMinutes: attempt.category.durationMinutes,
        questionCount: attempt.category.questionCount,
        isDemo: attempt.category.isDemo,
        demoKey: attempt.category.demoKey,
      }
    : null,
  responses: attempt.responses.map((response) => ({
    questionId: response.questionId,
    questionText: response.questionText,
    options: response.options,
    correctAnswer: response.correctAnswer,
    explanation: response.explanation,
    selectedAnswer: response.selectedAnswer,
    isCorrect: response.isCorrect,
  })),
});
