import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    attemptLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    marksPerQuestion: {
      type: Number,
      required: true,
      min: 0,
    },
    questionType: {
      type: String,
      enum: ["mcq", "msq"],
      default: "mcq",
    },
  },
  { _id: false },
);

const responseSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    questionImage: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      required: true,
    },
    sectionKey: {
      type: String,
      default: "main",
      trim: true,
      lowercase: true,
    },
    sectionTitle: {
      type: String,
      default: "Main section",
    },
    questionFormat: {
      type: String,
      enum: ["mcq", "msq"],
      default: "mcq",
    },
    marksPerQuestion: {
      type: Number,
      default: 1,
      min: 0,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    correctAnswer: {
      type: Number,
      default: null,
    },
    correctAnswers: {
      type: [Number],
      default: [],
    },
    explanation: {
      type: String,
      default: "",
    },
    selectedAnswer: {
      type: Number,
      default: null,
      min: 0,
      max: 3,
    },
    selectedAnswers: {
      type: [Number],
      default: [],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestCategory",
      required: true,
    },
    testType: {
      type: String,
      enum: ["subject", "flt"],
      required: true,
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    attemptedCount: {
      type: Number,
      default: 0,
    },
    unansweredCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    sections: [sectionSchema],
    questionOrder: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    responses: [responseSchema],
  },
  {
    timestamps: true,
  },
);

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;
