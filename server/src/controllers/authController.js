import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

const buildAuthPayload = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
  });

  res.status(201).json(buildAuthPayload(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.role === "debarred") {
    res.status(403);
    throw new Error("Your account has been debarred. Please contact the administrator.");
  }

  res.json(buildAuthPayload(user));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
