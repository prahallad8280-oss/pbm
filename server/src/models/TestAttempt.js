import mongoose from "mongoose";

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
    options: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: Number,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    selectedAnswer: {
      type: Number,
      default: null,
      min: 0,
      max: 3,
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

