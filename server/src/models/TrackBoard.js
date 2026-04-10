import mongoose from "mongoose";

const trackBoardItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    link: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: false,
  },
);

const trackBoardSchema = new mongoose.Schema(
  {
    trackSlug: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [trackBoardItemSchema],
      default: [],
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

const TrackBoard = mongoose.model("TrackBoard", trackBoardSchema);

export default TrackBoard;
