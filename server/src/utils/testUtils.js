const DEFAULT_SECTION_KEY = "main";

const toNumber = (value, fallback = 0) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : fallback;
};

const toPositiveInt = (value, fallback = 1) => Math.max(1, Math.round(toNumber(value, fallback)));

const roundScore = (value) => Number(toNumber(value, 0).toFixed(2));

export const normalizeSectionKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildDefaultSections = (category = {}) => {
  const defaultQuestionCount = toPositiveInt(category.questionCount, 1);

  return [
    {
      key: DEFAULT_SECTION_KEY,
      title: category.subjectLabel || category.name || "Main section",
      questionCount: defaultQuestionCount,
      attemptLimit: defaultQuestionCount,
      marksPerQuestion: 1,
      questionType: "mcq",
    },
  ];
};

export const normalizeCategorySections = (category = {}) => {
  const rawSections =
    Array.isArray(category.sections) && category.sections.length ? category.sections : buildDefaultSections(category);

  const usedKeys = new Set();

  return rawSections.map((section, index) => {
    const questionCount = toPositiveInt(section.questionCount, category.questionCount || 1);
    const attemptLimit = Math.min(toPositiveInt(section.attemptLimit, questionCount), questionCount);
    const baseKey = normalizeSectionKey(section.key || section.title || `section-${index + 1}`) || `section-${index + 1}`;
    let uniqueKey = baseKey;
    let suffix = 2;

    while (usedKeys.has(uniqueKey)) {
      uniqueKey = `${baseKey}-${suffix}`;
      suffix += 1;
    }

    usedKeys.add(uniqueKey);

    return {
      key: uniqueKey,
      title: String(section.title || `Section ${index + 1}`).trim(),
      questionCount,
      attemptLimit,
      marksPerQuestion: roundScore(Math.max(0, toNumber(section.marksPerQuestion, 1))),
      questionType: section.questionType === "msq" ? "msq" : "mcq",
    };
  });
};

export const buildSectionMap = (sections = []) =>
  sections.reduce((map, section) => {
    map[section.key] = section;
    return map;
  }, {});

export const getCategoryAttemptableCount = (category = {}) =>
  normalizeCategorySections(category).reduce((total, section) => total + section.attemptLimit, 0);

export const getCategoryTotalMarks = (category = {}) =>
  roundScore(
    normalizeCategorySections(category).reduce(
      (total, section) => total + section.attemptLimit * section.marksPerQuestion,
      0,
    ),
  );

export const formatCategoryForClient = (category, extra = {}) => {
  if (!category) {
    return null;
  }

  const sections = normalizeCategorySections(category);

  return {
    _id: category._id,
    id: category._id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    examName: category.examName,
    subjectLabel: category.subjectLabel,
    testType: category.testType,
    durationMinutes: category.durationMinutes,
    questionCount: sections.reduce((total, section) => total + section.questionCount, 0),
    attemptableCount: sections.reduce((total, section) => total + section.attemptLimit, 0),
    totalMarks: getCategoryTotalMarks({ sections }),
    isActive: category.isActive,
    isDemo: category.isDemo,
    demoKey: category.demoKey,
    sections,
    ...extra,
  };
};

export const normalizeCorrectAnswers = (question = {}) => {
  const rawAnswers =
    Array.isArray(question.correctAnswers) && question.correctAnswers.length
      ? question.correctAnswers
      : question.correctAnswer === null || question.correctAnswer === undefined
        ? []
        : [question.correctAnswer];

  return [...new Set(rawAnswers.map((value) => toNumber(value, -1)).filter((value) => value >= 0 && value <= 3))].sort(
    (left, right) => left - right,
  );
};

export const normalizeSelectedAnswers = (response = {}) => {
  const rawAnswers =
    Array.isArray(response.selectedAnswers) && response.selectedAnswers.length
      ? response.selectedAnswers
      : response.selectedAnswer === null || response.selectedAnswer === undefined
        ? []
        : [response.selectedAnswer];

  return [...new Set(rawAnswers.map((value) => toNumber(value, -1)).filter((value) => value >= 0 && value <= 3))].sort(
    (left, right) => left - right,
  );
};

export const normalizeQuestionSectionKey = (question = {}, sections = []) => {
  const normalizedSections = Array.isArray(sections) ? sections : normalizeCategorySections(sections);
  const nextKey = normalizeSectionKey(question.sectionKey);

  if (nextKey && normalizedSections.some((section) => section.key === nextKey)) {
    return nextKey;
  }

  if (normalizedSections.length === 1) {
    return normalizedSections[0].key;
  }

  return DEFAULT_SECTION_KEY;
};

export const normalizeQuestionFormat = (question = {}, sections = []) => {
  if (question.questionFormat === "msq" || question.questionFormat === "mcq") {
    return question.questionFormat;
  }

  const normalizedSections = Array.isArray(sections) ? sections : normalizeCategorySections(sections);
  const sectionKey = normalizeQuestionSectionKey(question, normalizedSections);
  const matchingSection = normalizedSections.find((section) => section.key === sectionKey);

  return matchingSection?.questionType || "mcq";
};

export const sanitizeQuestion = (question, category = null) => {
  const sections = normalizeCategorySections(category || { questionCount: 1 });
  const sectionKey = normalizeQuestionSectionKey(question, sections);
  const sectionMap = buildSectionMap(sections);
  const section = sectionMap[sectionKey] || sections[0];

  return {
    id: question._id,
    questionText: question.questionText,
    questionImage: question.questionImage || "",
    options: question.options,
    testType: question.testType,
    questionFormat: normalizeQuestionFormat(question, sections),
    sectionKey: section.key,
    sectionTitle: section.title,
    marksPerQuestion: section.marksPerQuestion,
  };
};

export const buildSectionSummaries = (sections = [], responses = []) => {
  const normalizedSections = Array.isArray(sections) && sections.length ? sections : buildDefaultSections();
  const baseSummaries = normalizedSections.map((section) => ({
    key: section.key,
    title: section.title,
    questionType: section.questionType,
    questionCount: section.questionCount,
    attemptLimit: section.attemptLimit,
    marksPerQuestion: section.marksPerQuestion,
    totalMarks: roundScore(section.attemptLimit * section.marksPerQuestion),
    attemptedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    unansweredCount: section.questionCount,
    score: 0,
  }));
  const summaryMap = buildSectionMap(baseSummaries);

  responses.forEach((response) => {
    const summary = summaryMap[response.sectionKey] || baseSummaries[0];

    if (!summary) {
      return;
    }

    const selectedAnswers = normalizeSelectedAnswers(response);

    if (!selectedAnswers.length) {
      return;
    }

    summary.attemptedCount += 1;
    summary.unansweredCount = Math.max(summary.questionCount - summary.attemptedCount, 0);

    if (response.isCorrect) {
      summary.correctCount += 1;
      summary.score = roundScore(summary.score + toNumber(response.marksAwarded, 0));
    } else {
      summary.incorrectCount += 1;
    }
  });

  return baseSummaries.map((summary) => ({
    ...summary,
    unansweredCount: Math.max(summary.questionCount - summary.attemptedCount, 0),
  }));
};

export const shuffleArray = (items = []) => {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
};

export const formatAttemptForClient = (attempt) => {
  const categorySections = normalizeCategorySections(attempt.category || { sections: attempt.sections, questionCount: attempt.totalQuestions });
  const sectionSummaries = buildSectionSummaries(categorySections, attempt.responses || []);

  return {
    id: attempt._id,
    status: attempt.status,
    testType: attempt.testType,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    timeTakenSeconds: attempt.timeTakenSeconds,
    totalQuestions: attempt.totalQuestions,
    attemptedCount:
      attempt.attemptedCount ??
      (attempt.responses || []).filter((response) => normalizeSelectedAnswers(response).length).length,
    unansweredCount:
      attempt.unansweredCount ??
      Math.max(
        attempt.totalQuestions -
          (attempt.responses || []).filter((response) => normalizeSelectedAnswers(response).length).length,
        0,
      ),
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    accuracy: attempt.accuracy,
    score: roundScore(attempt.score),
    totalMarks: roundScore(attempt.totalMarks ?? getCategoryTotalMarks({ sections: categorySections })),
    category: formatCategoryForClient(attempt.category || { sections: categorySections, questionCount: attempt.totalQuestions }),
    sections: categorySections,
    sectionSummaries,
    responses: (attempt.responses || []).map((response) => ({
      questionId: response.questionId,
      questionText: response.questionText,
      questionImage: response.questionImage || "",
      options: response.options,
      sectionKey: response.sectionKey || DEFAULT_SECTION_KEY,
      sectionTitle: response.sectionTitle || categorySections[0]?.title || "Main section",
      questionFormat: response.questionFormat || "mcq",
      marksPerQuestion: roundScore(response.marksPerQuestion ?? 1),
      marksAwarded: roundScore(response.marksAwarded ?? 0),
      correctAnswer:
        response.correctAnswer === null || response.correctAnswer === undefined ? null : Number(response.correctAnswer),
      correctAnswers: normalizeCorrectAnswers(response),
      explanation: response.explanation,
      selectedAnswer:
        response.selectedAnswer === null || response.selectedAnswer === undefined ? null : Number(response.selectedAnswer),
      selectedAnswers: normalizeSelectedAnswers(response),
      isCorrect: response.isCorrect,
    })),
  };
};
