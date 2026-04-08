import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestCategory from "../models/TestCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import { formatAttemptForClient, sanitizeQuestion, shuffleArray } from "../utils/testUtils.js";

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
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));
  const responseMap = new Map(
    responses.map((response) => [
      String(response.questionId),
      response.selectedAnswer === null || response.selectedAnswer === undefined
        ? null
        : Number(response.selectedAnswer),
    ]),
  );

  const storedResponses = attempt.questionOrder
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
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        selectedAnswer,
        isCorrect,
      };
    })
    .filter(Boolean);

  const correctCount = storedResponses.filter((response) => response.isCorrect).length;
  const totalQuestions = storedResponses.length;
  const incorrectCount = totalQuestions - correctCount;
  const accuracy = totalQuestions
    ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
    : 0;

  attempt.responses = storedResponses;
  attempt.status = "completed";
  attempt.submittedAt = new Date();
  attempt.timeTakenSeconds = Number(timeTakenSeconds) || 0;
  attempt.totalQuestions = totalQuestions;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.accuracy = accuracy;
  attempt.score = correctCount;

  await attempt.save();

  res.json(formatAttemptForClient(attempt));
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

