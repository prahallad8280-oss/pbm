import jwt from "jsonwebtoken";

import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Authorization token missing.");
  }

  const token = authorization.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    res.status(401);
    throw new Error("Token is invalid or expired.");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("User not found.");
  }

  if (user.role === "debarred") {
    res.status(403);
    throw new Error("Your account has been debarred. Please contact the administrator.");
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error("You do not have permission to access this resource.");
  }

  next();
};
