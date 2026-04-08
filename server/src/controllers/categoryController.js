import TestCategory from "../models/TestCategory.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };

  if (req.query.testType) {
    filter.testType = req.query.testType;
  }

  const categories = await TestCategory.find(filter).sort({ testType: 1, name: 1 });
  res.json(categories);
});
