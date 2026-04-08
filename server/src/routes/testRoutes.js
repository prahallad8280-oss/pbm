import express from "express";

import {
  getAttemptById,
  getAttemptHistory,
  startPublicFeaturedTest,
  startTest,
  submitPublicFeaturedTest,
  submitTest,
} from "../controllers/testController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public/featured/:featuredKey", startPublicFeaturedTest);
router.post("/public/featured/:featuredKey/submit", submitPublicFeaturedTest);

router.use(protect);

router.post("/start", startTest);
router.get("/attempts", getAttemptHistory);
router.get("/attempts/:attemptId", getAttemptById);
router.post("/:attemptId/submit", submitTest);

export default router;
