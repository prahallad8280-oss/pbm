import Question from "../models/Question.js";
import TestAttempt from "../models/TestAttempt.js";
import TestCategory from "../models/TestCategory.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

const MANAGED_USER_ROLES = ["user", "editor", "admin", "debarred"];

const toSlug = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const validateQuestionPayload = ({ questionText, category, testType, options, correctAnswer, explanation }) => {
  if (!questionText || !category || !testType || !explanation) {
    return "Question text, category, test type, and explanation are required.";
  }

  if (!Array.isArray(options) || options.length !== 4 || options.some((option) => !String(option).trim())) {
    return "Exactly four non-empty options are required.";
  }

  if (![0, 1, 2, 3].includes(Number(correctAnswer))) {
    return "correctAnswer must be a number between 0 and 3.";
  }

  return null;
};

export const getAdminOverview = asyncHandler(async (_req, res) => {
  const [userCount, categoryCount, questionCount, attemptCount, feedbackCount, notificationCount, recentAttempts] =
    await Promise.all([
    User.countDocuments({ role: { $in: ["user", "debarred"] } }),
    TestCategory.countDocuments(),
    Question.countDocuments(),
    TestAttempt.countDocuments({ status: "completed" }),
    Feedback.countDocuments(),
    Notification.countDocuments({ isActive: true }),
    TestAttempt.find({ status: "completed" })
      .populate("user", "name email")
      .populate("category", "name testType")
      .sort({ submittedAt: -1 })
      .limit(6),
  ]);

  res.json({
    stats: {
      userCount,
      categoryCount,
      questionCount,
      attemptCount,
      feedbackCount,
      notificationCount,
    },
    recentAttempts: recentAttempts.map((attempt) => ({
      id: attempt._id,
      score: attempt.score,
      accuracy: attempt.accuracy,
      submittedAt: attempt.submittedAt,
      user: attempt.user
        ? {
            id: attempt.user._id,
            name: attempt.user.name,
            email: attempt.user.email,
          }
        : null,
      category: attempt.category
        ? {
            id: attempt.category._id,
            name: attempt.category.name,
            testType: attempt.category.testType,
          }
        : null,
    })),
  });
});

export const getAdminUsers = asyncHandler(async (_req, res) => {
  const [users, attempts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    TestAttempt.find({ status: "completed" })
      .populate("category", "name testType")
      .sort({ submittedAt: -1 })
      .lean(),
  ]);

  const attemptsByUser = attempts.reduce((map, attempt) => {
    const key = String(attempt.user);
    map[key] = map[key] || [];
    map[key].push(attempt);
    return map;
  }, {});

  const summary = users.reduce(
    (totals, user) => {
      totals.total += 1;
      if (Object.hasOwn(totals, user.role)) {
        totals[user.role] += 1;
      }
      return totals;
    },
    {
      total: 0,
      user: 0,
      editor: 0,
      admin: 0,
      debarred: 0,
    },
  );

  res.json({
    summary,
    users: users.map((user) => {
      const history = (attemptsByUser[String(user._id)] || []).map((attempt) => ({
        id: attempt._id,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        accuracy: attempt.accuracy,
        submittedAt: attempt.submittedAt,
        testType: attempt.testType,
        category: attempt.category
          ? {
              id: attempt.category._id,
              name: attempt.category.name,
              testType: attempt.category.testType,
            }
          : null,
      }));

      const averageAccuracy = history.length
        ? Number((history.reduce((total, attempt) => total + Number(attempt.accuracy || 0), 0) / history.length).toFixed(2))
        : 0;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        attemptCount: history.length,
        averageAccuracy,
        lastAttemptAt: history[0]?.submittedAt || null,
        attempts: history,
      };
    }),
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const nextRole = String(req.body.role || "").trim();

  if (!MANAGED_USER_ROLES.includes(nextRole)) {
    res.status(400);
    throw new Error("Role must be one of user, editor, admin, or debarred.");
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error("You cannot change your own role from this screen.");
  }

  user.role = nextRole;
  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

export const getAdminNotifications = asyncHandler(async (_req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
  res.json(notifications);
});

export const createNotification = asyncHandler(async (req, res) => {
  const label = String(req.body.label || "").trim();
  const title = String(req.body.title || "").trim();
  const body = String(req.body.body || "").trim();
  const link = String(req.body.link || "").trim();

  if (!label || !title || !body) {
    res.status(400);
    throw new Error("Label, title, and notification text are required.");
  }

  const notification = await Notification.create({
    label,
    title,
    body,
    link,
    isActive: req.body.isActive ?? true,
  });

  res.status(201).json(notification);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.notificationId);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  await notification.deleteOne();
  res.json({ message: "Notification deleted successfully." });
});

export const getAdminFeedback = asyncHandler(async (_req, res) => {
  const feedback = await Feedback.find().sort({ createdAt: -1 }).lean();
  res.json(feedback);
});

export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["new", "reviewed"].includes(status)) {
    res.status(400);
    throw new Error("Feedback status must be either new or reviewed.");
  }

  const feedback = await Feedback.findById(req.params.feedbackId);

  if (!feedback) {
    res.status(404);
    throw new Error("Feedback item not found.");
  }

  feedback.status = status;
  await feedback.save();

  res.json(feedback);
});

export const getAdminQuestions = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.testType) {
    filter.testType = req.query.testType;
  }

  const questions = await Question.find(filter)
    .populate("category", "name testType")
    .sort({ createdAt: -1 });

  res.json(questions);
});

export const createQuestion = asyncHandler(async (req, res) => {
  const validationError = validateQuestionPayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const question = await Question.create({
    questionText: req.body.questionText,
    category: req.body.category,
    testType: req.body.testType,
    options: req.body.options,
    correctAnswer: Number(req.body.correctAnswer),
    explanation: req.body.explanation,
    createdBy: req.user._id,
  });

  await question.populate("category", "name testType");

  res.status(201).json(question);
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const validationError = validateQuestionPayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const question = await Question.findById(req.params.questionId);

  if (!question) {
    res.status(404);
    throw new Error("Question not found.");
  }

  question.questionText = req.body.questionText;
  question.category = req.body.category;
  question.testType = req.body.testType;
  question.options = req.body.options;
  question.correctAnswer = Number(req.body.correctAnswer);
  question.explanation = req.body.explanation;

  await question.save();
  await question.populate("category", "name testType");

  res.json(question);
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.questionId);

  if (!question) {
    res.status(404);
    throw new Error("Question not found.");
  }

  await question.deleteOne();
  res.json({ message: "Question deleted successfully." });
});

export const getAdminCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    TestCategory.find().sort({ testType: 1, name: 1 }).lean(),
    Question.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countMap = counts.reduce((map, item) => {
    map[String(item._id)] = item.count;
    return map;
  }, {});

  res.json(
    categories.map((category) => ({
      ...category,
      questionBankSize: countMap[String(category._id)] || 0,
    })),
  );
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description = "", testType, durationMinutes, questionCount, isActive = true } = req.body;

  if (!name || !testType || !durationMinutes || !questionCount) {
    res.status(400);
    throw new Error("Name, test type, duration, and question count are required.");
  }

  const slug = req.body.slug ? toSlug(req.body.slug) : toSlug(name);
  const existingCategory = await TestCategory.findOne({ slug });

  if (existingCategory) {
    res.status(409);
    throw new Error("A category with this slug already exists.");
  }

  const category = await TestCategory.create({
    name,
    slug,
    description,
    testType,
    durationMinutes: Number(durationMinutes),
    questionCount: Number(questionCount),
    isActive,
  });

  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await TestCategory.findById(req.params.categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const nextSlug = req.body.slug ? toSlug(req.body.slug) : toSlug(req.body.name || category.name);

  const duplicateCategory = await TestCategory.findOne({
    slug: nextSlug,
    _id: { $ne: category._id },
  });

  if (duplicateCategory) {
    res.status(409);
    throw new Error("Another category already uses this slug.");
  }

  category.name = req.body.name ?? category.name;
  category.slug = nextSlug;
  category.description = req.body.description ?? category.description;
  category.testType = req.body.testType ?? category.testType;
  category.durationMinutes = Number(req.body.durationMinutes ?? category.durationMinutes);
  category.questionCount = Number(req.body.questionCount ?? category.questionCount);
  category.isActive = req.body.isActive ?? category.isActive;

  await category.save();

  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await TestCategory.findById(req.params.categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found.");
  }

  const linkedQuestions = await Question.countDocuments({ category: category._id });

  if (linkedQuestions > 0) {
    res.status(400);
    throw new Error("Delete or move the linked questions before removing this category.");
  }

  await category.deleteOne();
  res.json({ message: "Category deleted successfully." });
});
