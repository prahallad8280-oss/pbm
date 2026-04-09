import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestCategory from "../models/TestCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatAttemptForClient, sanitizeQuestion, shuffleArray } from "../utils/testUtils.js";
import jwt from "jsonwebtoken";

const FEATURED_PUBLIC_TESTS = {
  "mathematics-ma-2023-june": {
    terms: ["math", "2023", "june"],
  },
};

const normalizeText = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const buildStoredResponses = (questionOrder, questions, responses = []) => {
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const responseMap = new Map(
    responses.map((response) => [
      String(response.questionId),
      response.selectedAnswer === null || response.selectedAnswer === undefined
        ? null
        : Number(response.selectedAnswer),
    ]),
  );

  return questionOrder
    .map((questionId) => {
      const question = questionMap.get(String(questionId));

      if (!question) {
        return null;
      }

      const selectedAnswer = responseMap.has(String(questionId))
        ? responseMap.get(String(questionId))
        : null;
      const isCorrect = selectedAnswer === question.correctAnswer;

      return {
        questionId: question._id,
        questionText: question.questionText,
        questionImage: question.questionImage || "",
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        selectedAnswer,
        isCorrect,
      };
    })
    .filter(Boolean);
};

const calculateResultMetrics = (storedResponses) => {
  const correctCount = storedResponses.filter((response) => response.isCorrect).length;
  const totalQuestions = storedResponses.length;
  const incorrectCount = totalQuestions - correctCount;
  const accuracy = totalQuestions
    ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
    : 0;

  return {
    totalQuestions,
    correctCount,
    incorrectCount,
    accuracy,
    score: correctCount,
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
  const storedResponses = buildStoredResponses(questionOrder, questions, responses);
  const metrics = calculateResultMetrics(storedResponses);

  return {
    id: `public-${featuredKey}`,
    status: "completed",
    testType: category.testType,
    startedAt: null,
    submittedAt: new Date().toISOString(),
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
    totalQuestions: metrics.totalQuestions,
    correctCount: metrics.correctCount,
    incorrectCount: metrics.incorrectCount,
    accuracy: metrics.accuracy,
    score: metrics.score,
    category: {
      id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      examName: category.examName,
      subjectLabel: category.subjectLabel,
      testType: category.testType,
      durationMinutes: category.durationMinutes,
      questionCount: category.questionCount,
      isDemo: category.isDemo,
      demoKey: category.demoKey,
    },
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

  const questionBank = await Question.find({ category: categoryId }).lean();

  if (!questionBank.length) {
    res.status(400);
    throw new Error("No questions are available for this category yet.");
  }

  const randomizedQuestions = shuffleArray(questionBank).slice(
    0,
    Math.min(category.questionCount, questionBank.length),
  );

  const attempt = await TestAttempt.create({
    user: req.user._id,
    category: category._id,
    testType: category.testType,
    totalQuestions: randomizedQuestions.length,
    questionOrder: randomizedQuestions.map((question) => question._id),
  });

  res.status(201).json({
    attemptId: attempt._id,
    category,
    durationMinutes: category.durationMinutes,
    questions: randomizedQuestions.map(sanitizeQuestion),
  });
});

export const startPublicFeaturedTest = asyncHandler(async (req, res) => {
  const { featuredKey } = req.params;
  const category = await findFeaturedPublicCategory(featuredKey);

  if (!category) {
    res.status(404);
    throw new Error("Featured mock test was not found.");
  }

  const questionBank = await Question.find({ category: category._id }).lean();

  if (!questionBank.length) {
    res.status(400);
    throw new Error("No questions are available for this featured test yet.");
  }

  const randomizedQuestions = shuffleArray(questionBank).slice(
    0,
    Math.min(category.questionCount, questionBank.length),
  );

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
    category,
    durationMinutes: category.durationMinutes,
    questions: randomizedQuestions.map(sanitizeQuestion),
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

  const questions = await Question.find({ _id: { $in: attempt.questionOrder } }).lean();
  const storedResponses = buildStoredResponses(attempt.questionOrder, questions, responses);
  const metrics = calculateResultMetrics(storedResponses);

  attempt.responses = storedResponses;
  attempt.status = "completed";
  attempt.submittedAt = new Date();
  attempt.timeTakenSeconds = Number(timeTakenSeconds) || 0;
  attempt.totalQuestions = metrics.totalQuestions;
  attempt.correctCount = metrics.correctCount;
  attempt.incorrectCount = metrics.incorrectCount;
  attempt.accuracy = metrics.accuracy;
  attempt.score = metrics.score;

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
  const result = buildPublicResult({
    category,
    questionOrder: decodedSession.questionOrder,
    questions,
    responses,
    timeTakenSeconds,
    featuredKey,
  });

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
