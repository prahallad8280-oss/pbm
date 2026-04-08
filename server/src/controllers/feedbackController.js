import asyncHandler from "../utils/asyncHandler.js";
import Feedback from "../models/Feedback.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanInput = (value = "") => value.toString().trim();

export const submitFeedback = asyncHandler(async (req, res) => {
  const name = cleanInput(req.body.name);
  const email = cleanInput(req.body.email).toLowerCase();
  const message = cleanInput(req.body.message);

  if (!name || !email || !message) {
    res.status(400);
    throw new Error("Name, email, and feedback are required.");
  }

  if (!emailPattern.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address.");
  }

  if (message.length < 10) {
    res.status(400);
    throw new Error("Please write a little more detail in your feedback.");
  }

  await Feedback.create({
    name,
    email,
    message,
    sourceUrl: req.headers.origin || req.headers.referer || "Unknown",
    userAgent: req.get("user-agent") || "Unknown",
  });

  res.status(201).json({
    message: "Feedback submitted successfully.",
  });
});
