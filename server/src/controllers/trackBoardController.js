import TrackBoard from "../models/TrackBoard.js";
import asyncHandler from "../utils/asyncHandler.js";

const normalizeItems = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      title: String(item?.title || "").trim(),
      link: String(item?.link || "").trim(),
    }))
    .filter((item) => item.title && item.link);
};

const validateTrackBoardPayload = ({ trackSlug, title, items }) => {
  if (!String(trackSlug || "").trim()) {
    return "Track is required.";
  }

  if (!String(title || "").trim()) {
    return "Board title is required.";
  }

  const cleanedItems = normalizeItems(items);

  if (!cleanedItems.length) {
    return "Add at least one linked item to this board.";
  }

  return null;
};

export const getPublicTrackBoards = asyncHandler(async (req, res) => {
  const trackSlug = String(req.query.track || "").trim();

  if (!trackSlug) {
    res.status(400);
    throw new Error("Track is required.");
  }

  const boards = await TrackBoard.find({
    trackSlug,
    isActive: true,
  })
    .sort({ createdAt: 1 })
    .lean();

  res.json(boards);
});

export const getAdminTrackBoards = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.track) {
    filter.trackSlug = String(req.query.track).trim();
  }

  const boards = await TrackBoard.find(filter).sort({ createdAt: 1 }).lean();
  res.json(boards);
});

export const createTrackBoard = asyncHandler(async (req, res) => {
  const validationError = validateTrackBoardPayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const board = await TrackBoard.create({
    trackSlug: String(req.body.trackSlug).trim(),
    title: String(req.body.title).trim(),
    isActive: req.body.isActive ?? true,
    items: normalizeItems(req.body.items),
    createdBy: req.user._id,
  });

  res.status(201).json(board);
});

export const updateTrackBoard = asyncHandler(async (req, res) => {
  const validationError = validateTrackBoardPayload(req.body);

  if (validationError) {
    res.status(400);
    throw new Error(validationError);
  }

  const board = await TrackBoard.findById(req.params.boardId);

  if (!board) {
    res.status(404);
    throw new Error("Track board not found.");
  }

  board.trackSlug = String(req.body.trackSlug).trim();
  board.title = String(req.body.title).trim();
  board.isActive = req.body.isActive ?? board.isActive;
  board.items = normalizeItems(req.body.items);

  await board.save();

  res.json(board);
});

export const deleteTrackBoard = asyncHandler(async (req, res) => {
  const board = await TrackBoard.findById(req.params.boardId);

  if (!board) {
    res.status(404);
    throw new Error("Track board not found.");
  }

  await board.deleteOne();
  res.json({ message: "Track board deleted successfully." });
});
