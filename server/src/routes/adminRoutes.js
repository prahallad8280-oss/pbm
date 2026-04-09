import express from "express";

import {
  createCategory,
  createNotification,
  createQuestion,
  deleteCategory,
  deleteNotification,
  deleteQuestion,
  getAdminCategories,
  getAdminFeedback,
  getAdminNotifications,
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
router
  .route("/notifications")
  .get(getAdminNotifications)
  .post(createNotification);
router.delete("/notifications/:notificationId", deleteNotification);
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
