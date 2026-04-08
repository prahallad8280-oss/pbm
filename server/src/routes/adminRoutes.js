import express from "express";

import {
  createCategory,
  createQuestion,
  deleteCategory,
  deleteQuestion,
  getAdminCategories,
  getAdminFeedback,
  getAdminOverview,
  getAdminQuestions,
  updateFeedbackStatus,
  updateCategory,
  updateQuestion,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/feedback", getAdminFeedback);
router.patch("/feedback/:feedbackId", updateFeedbackStatus);

router
  .route("/questions")
  .get(getAdminQuestions)
  .post(createQuestion);

router
  .route("/questions/:questionId")
  .put(updateQuestion)
  .delete(deleteQuestion);

router
  .route("/categories")
  .get(getAdminCategories)
  .post(createCategory);

router
  .route("/categories/:categoryId")
  .put(updateCategory)
  .delete(deleteCategory);

export default router;
