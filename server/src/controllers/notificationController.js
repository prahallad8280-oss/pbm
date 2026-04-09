import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getPublicNotifications = asyncHandler(async (_req, res) => {
  const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 }).limit(6).lean();
  res.json(notifications);
});

