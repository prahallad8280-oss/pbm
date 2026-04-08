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
    questionText: {
      type: String,
      required: true,
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
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      required: true,
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

