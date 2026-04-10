import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
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
    sectionKey: {
      type: String,
      default: "main",
      trim: true,
      lowercase: true,
    },
    questionFormat: {
      type: String,
      enum: ["mcq", "msq"],
      default: "mcq",
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    questionImage: {
      type: String,
      default: "",
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Each question must have exactly four options.",
      },
    },
    correctAnswer: {
      type: Number,
      min: 0,
      max: 3,
      default: null,
    },
    correctAnswers: {
      type: [Number],
      default: undefined,
      validate: {
        validator: (value) =>
          value === undefined ||
          (Array.isArray(value) &&
            value.length >= 1 &&
            value.length <= 4 &&
            value.every((item) => Number.isInteger(item) && item >= 0 && item <= 3)),
        message: "correctAnswers must contain one to four option indexes between 0 and 3.",
      },
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
