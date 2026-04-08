import mongoose from "mongoose";

const testCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    testType: {
      type: String,
      enum: ["subject", "flt"],
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
      default: 60,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      default: 20,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const TestCategory = mongoose.model("TestCategory", testCategorySchema);

export default TestCategory;

