import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestCategory from "../models/TestCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  buildSectionMap,
  buildSectionSummaries,
  formatAttemptForClient,
  formatCategoryForClient,
  getCategoryTotalMarks,
  normalizeCategorySections,
  normalizeCorrectAnswers,
  normalizeQuestionFormat,
  normalizeQuestionSectionKey,
  normalizeSelectedAnswers,
  sanitizeQuestion,
  shuffleArray,
} from "../utils/testUtils.js";
import jwt from "jsonwebtoken";

const FEATURED_PUBLIC_TESTS = {
  "mathematics-ma-2023-june": {
    terms: ["math", "2023", "june"],
  },
};

const normalizeText = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const sameAnswers = (left = [], right = []) =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const buildStoredResponses = (questionOrder, questions, responses = [], sections = []) => {
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const sectionMap = buildSectionMap(sections);
  const responseMap = new Map(
    responses.map((response) => [
      String(response.questionId),
      normalizeSelectedAnswers(response),
    ]),
  );

  return questionOrder
    .map((questionId) => {
      const question = questionMap.get(String(questionId));

      if (!question) {
        return null;
      }

      const sectionKey = normalizeQuestionSectionKey(question, sections);
      const section = sectionMap[sectionKey] || sections[0];
      const correctAnswers = normalizeCorrectAnswers(question);
      const selectedAnswers = responseMap.has(String(questionId)) ? responseMap.get(String(questionId)) : [];
      const isCorrect = selectedAnswers.length > 0 && sameAnswers(selectedAnswers, correctAnswers);

      return {
        questionId: question._id,
        questionText: question.questionText,
        questionImage: question.questionImage || "",
        sectionKey: section?.key || "main",
        sectionTitle: section?.title || "Main section",
        questionFormat: normalizeQuestionFormat(question, sections),
        marksPerQuestion: Number(section?.marksPerQuestion || 1),
        marksAwarded: isCorrect ? Number(section?.marksPerQuestion || 1) : 0,
        options: question.options,
        correctAnswer: correctAnswers.length === 1 ? correctAnswers[0] : null,
        correctAnswers,
        explanation: question.explanation,
        selectedAnswer: selectedAnswers.length === 1 ? selectedAnswers[0] : null,
        selectedAnswers,
        isCorrect,
      };
    })
    .filter(Boolean);
};

const validateAttemptLimits = (storedResponses, sections = []) => {
  const sectionMap = buildSectionMap(sections);
  const attemptCounts = storedResponses.reduce((counts, response) => {
    const selectedAnswers = normalizeSelectedAnswers(response);

    if (response.questionFormat === "mcq" && selectedAnswers.length > 1) {
      throw new Error(`MCQ question in ${response.sectionTitle} cannot have multiple selected answers.`);
    }

    if (!selectedAnswers.length) {
      return counts;
    }

    counts[response.sectionKey] = (counts[response.sectionKey] || 0) + 1;
    return counts;
  }, {});

  const overflowSection = sections.find((section) => (attemptCounts[section.key] || 0) > section.attemptLimit);

  if (overflowSection) {
    const attempted = attemptCounts[overflowSection.key] || 0;
    throw new Error(`Attempt limit exceeded in ${overflowSection.title}. Allowed ${overflowSection.attemptLimit}, received ${attempted}.`);
  }

  return { sectionMap, attemptCounts };
};

const calculateResultMetrics = (storedResponses, sections = []) => {
  const attemptedCount = storedResponses.filter((response) => normalizeSelectedAnswers(response).length).length;
  const correctCount = storedResponses.filter((response) => response.isCorrect).length;
  const totalQuestions = storedResponses.length;
  const incorrectCount = Math.max(attemptedCount - correctCount, 0);
  const unansweredCount = Math.max(totalQuestions - attemptedCount, 0);
  const accuracy = attemptedCount
    ? Number(((correctCount / attemptedCount) * 100).toFixed(2))
    : 0;
  const score = Number(
    storedResponses.reduce((total, response) => total + Number(response.marksAwarded || 0), 0).toFixed(2),
  );

  return {
    totalQuestions,
    attemptedCount,
    unansweredCount,
    correctCount,
    incorrectCount,
    accuracy,
    score,
    totalMarks: getCategoryTotalMarks({ sections }),
  };
};

const findFeaturedPublicCategory = async (featuredKey) => {
  const explicitDemoCategory = await TestCategory.findOne({
    isActive: true,
    isDemo: true,
    demoKey: String(featuredKey || "").trim().toLowerCase(),
  }).lean();

  if (explicitDemoCategory) {
    return explicitDemoCategory;
  }

  const featuredConfig = FEATURED_PUBLIC_TESTS[featuredKey];

  if (!featuredConfig) {
    return null;
  }

  const categories = await TestCategory.find({ isActive: true, testType: "flt" }).lean();

  return (
    categories.find((category) => {
      const haystack = normalizeText(`${category.name} ${category.slug} ${category.description}`);
      return featuredConfig.terms.every((term) => haystack.includes(term));
    }) || null
  );
};

const buildPublicResult = ({ category, questionOrder, questions, responses, timeTakenSeconds, featuredKey }) => {
  const sections = normalizeCategorySections(category);
  const storedResponses = buildStoredResponses(questionOrder, questions, responses, sections);
  validateAttemptLimits(storedResponses, sections);
  const metrics = calculateResultMetrics(storedResponses, sections);
  const sectionSummaries = buildSectionSummaries(sections, storedResponses);

  return {
    id: `public-${featuredKey}`,
    status: "completed",
    testType: category.testType,
    startedAt: null,
    submittedAt: new Date().toISOString(),
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    totalQuestions: metrics.totalQuestions,
    attemptedCount: metrics.attemptedCount,
    unansweredCount: metrics.unansweredCount,
    correctCount: metrics.correctCount,
    incorrectCount: metrics.incorrectCount,
    accuracy: metrics.accuracy,
    score: metrics.score,
    totalMarks: metrics.totalMarks,
    category: formatCategoryForClient(category),
    sections,
    sectionSummaries,
    responses: storedResponses,
  };
};

export const startTest = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;

  if (!categoryId) {
    res.status(400);
    throw new Error("categoryId is required.");
  }

  const category = await TestCategory.findById(categoryId);

  if (!category || !category.isActive) {
    res.status(404);
    throw new Error("Selected test category was not found.");
  }

  const categorySnapshot = category.toObject();
  const sections = normalizeCategorySections(categorySnapshot);
  const sectionMap = buildSectionMap(sections);
  const questionBank = await Question.find({ category: categoryId }).lean();

  if (!questionBank.length) {
    res.status(400);
    throw new Error("No questions are available for this category yet.");
  }

  const randomizedQuestions = sections.flatMap((section) => {
    const matchingQuestions = questionBank.filter((question) => {
      const questionSectionKey = normalizeQuestionSectionKey(question, sections);
      const questionFormat = normalizeQuestionFormat(question, sections);

      return questionSectionKey === section.key && questionFormat === section.questionType;
    });

    if (matchingQuestions.length < section.questionCount) {
      res.status(400);
      throw new Error(
        `${section.title} needs ${section.questionCount} ${section.questionType.toUpperCase()} questions, but only ${matchingQuestions.length} are available.`,
      );
    }

    return shuffleArray(matchingQuestions).slice(0, section.questionCount);
  });

  const attempt = await TestAttempt.create({
    user: req.user._id,
    category: category._id,
    testType: category.testType,
    sections,
    totalQuestions: randomizedQuestions.length,
    totalMarks: getCategoryTotalMarks({ sections }),
    questionOrder: randomizedQuestions.map((question) => question._id),
  });

  res.status(201).json({
    attemptId: attempt._id,
    category: formatCategoryForClient(categorySnapshot),
    durationMinutes: category.durationMinutes,
    questions: randomizedQuestions.map((question) => sanitizeQuestion(question, { sections })),
  });
});

export const startPublicFeaturedTest = asyncHandler(async (req, res) => {
  const { featuredKey } = req.params;
  const category = await findFeaturedPublicCategory(featuredKey);

  if (!category) {
    res.status(404);
    throw new Error("Featured mock test was not found.");
  }

  const sections = normalizeCategorySections(category);
  const questionBank = await Question.find({ category: category._id }).lean();

  if (!questionBank.length) {
    res.status(400);
    throw new Error("No questions are available for this featured test yet.");
  }

  const randomizedQuestions = sections.flatMap((section) => {
    const matchingQuestions = questionBank.filter((question) => {
      const questionSectionKey = normalizeQuestionSectionKey(question, sections);
      const questionFormat = normalizeQuestionFormat(question, sections);

      return questionSectionKey === section.key && questionFormat === section.questionType;
    });

    if (matchingQuestions.length < section.questionCount) {
      res.status(400);
      throw new Error(
        `${section.title} needs ${section.questionCount} ${section.questionType.toUpperCase()} questions, but only ${matchingQuestions.length} are available.`,
      );
    }

    return shuffleArray(matchingQuestions).slice(0, section.questionCount);
  });

  const sessionToken = jwt.sign(
    {
      mode: "public-featured-test",
      featuredKey,
      categoryId: String(category._id),
      questionOrder: randomizedQuestions.map((question) => String(question._id)),
    },
    process.env.JWT_SECRET,
    { expiresIn: "3h" },
  );

  res.json({
    featuredKey,
    sessionToken,
    category: formatCategoryForClient(category),
    durationMinutes: category.durationMinutes,
    questions: randomizedQuestions.map((question) => sanitizeQuestion(question, { sections })),
  });
});

export const submitTest = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { responses = [], timeTakenSeconds = 0 } = req.body;

  const attempt = await TestAttempt.findOne({
    _id: attemptId,
    user: req.user._id,
  }).populate("category");

  if (!attempt) {
    res.status(404);
    throw new Error("Test attempt not found.");
  }

  if (attempt.status === "completed") {
    res.status(409);
    throw new Error("This attempt has already been submitted.");
  }

  const sections = normalizeCategorySections(attempt.category?.toObject?.() || attempt.category || { sections: attempt.sections });
  const questions = await Question.find({ _id: { $in: attempt.questionOrder } }).lean();
  const storedResponses = buildStoredResponses(attempt.questionOrder, questions, responses, sections);

  try {
    validateAttemptLimits(storedResponses, sections);
  } catch (error) {
    res.status(400);
    throw error;
  }

  const metrics = calculateResultMetrics(storedResponses, sections);

  attempt.responses = storedResponses;
  attempt.status = "completed";
  attempt.submittedAt = new Date();
  attempt.timeTakenSeconds = Number(timeTakenSeconds) || 0;
  attempt.totalQuestions = metrics.totalQuestions;
  attempt.attemptedCount = metrics.attemptedCount;
  attempt.unansweredCount = metrics.unansweredCount;
  attempt.correctCount = metrics.correctCount;
  attempt.incorrectCount = metrics.incorrectCount;
  attempt.accuracy = metrics.accuracy;
  attempt.score = metrics.score;
  attempt.totalMarks = metrics.totalMarks;
  attempt.sections = sections;

  await attempt.save();

  res.json(formatAttemptForClient(attempt));
});

export const submitPublicFeaturedTest = asyncHandler(async (req, res) => {
  const { featuredKey } = req.params;
  const { responses = [], timeTakenSeconds = 0, sessionToken } = req.body;

  if (!sessionToken) {
    res.status(400);
    throw new Error("sessionToken is required.");
  }

  let decodedSession;

  try {
    decodedSession = jwt.verify(sessionToken, process.env.JWT_SECRET);
  } catch (_error) {
    res.status(401);
    throw new Error("Public test session is invalid or expired.");
  }

  if (
    decodedSession.mode !== "public-featured-test" ||
    decodedSession.featuredKey !== featuredKey ||
    !decodedSession.categoryId ||
    !Array.isArray(decodedSession.questionOrder)
  ) {
    res.status(400);
    throw new Error("Public test session is not valid for this request.");
  }

  const category = await findFeaturedPublicCategory(featuredKey);

  if (!category || String(category._id) !== decodedSession.categoryId) {
    res.status(404);
    throw new Error("Featured mock test was not found.");
  }

  const questions = await Question.find({ _id: { $in: decodedSession.questionOrder } }).lean();
  let result;

  try {
    result = buildPublicResult({
      category,
      questionOrder: decodedSession.questionOrder,
      questions,
      responses,
      timeTakenSeconds,
      featuredKey,
    });
  } catch (error) {
    res.status(400);
    throw error;
  }

  res.json(result);
});

export const getAttemptHistory = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({
    user: req.user._id,
    status: "completed",
  })
    .populate("category")
    .sort({ submittedAt: -1 });

  res.json(attempts.map(formatAttemptForClient));
});

export const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await TestAttempt.findOne({
    _id: req.params.attemptId,
    user: req.user._id,
  }).populate("category");

  if (!attempt) {
    res.status(404);
    throw new Error("Attempt details were not found.");
  }

  res.json(formatAttemptForClient(attempt));
});
