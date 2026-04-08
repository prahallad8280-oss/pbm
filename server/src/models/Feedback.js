import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;

