import express from "express";

import {
  createCategory,
  createNotification,
  createQuestion,
  createTrackBoard,
  deleteCategory,
  deleteNotification,
  deleteQuestion,
  deleteTrackBoard,
  getAdminCategories,
  getAdminFeedback,
  getAdminNotifications,
  getAdminOverview,
  getAdminQuestions,
  getAdminTrackBoards,
  getAdminUsers,
  updateFeedbackStatus,
  updateCategory,
  updateQuestion,
  updateTrackBoard,
  updateUserRole,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/overview", authorize("admin"), getAdminOverview);
router.get("/feedback", authorize("admin"), getAdminFeedback);
router.get("/users", authorize("admin"), getAdminUsers);
router.patch("/users/:userId/role", authorize("admin"), updateUserRole);
router
  .route("/notifications")
  .get(authorize("admin", "editor"), getAdminNotifications)
  .post(authorize("admin", "editor"), createNotification);
router.delete("/notifications/:notificationId", authorize("admin", "editor"), deleteNotification);
router.patch("/feedback/:feedbackId", authorize("admin"), updateFeedbackStatus);
router
  .route("/track-boards")
  .get(authorize("admin", "editor"), getAdminTrackBoards)
  .post(authorize("admin", "editor"), createTrackBoard);
router
  .route("/track-boards/:boardId")
  .put(authorize("admin", "editor"), updateTrackBoard)
  .delete(authorize("admin", "editor"), deleteTrackBoard);

router
  .route("/questions")
  .get(authorize("admin", "editor"), getAdminQuestions)
  .post(authorize("admin", "editor"), createQuestion);

router
  .route("/questions/:questionId")
  .put(authorize("admin", "editor"), updateQuestion)
  .delete(authorize("admin", "editor"), deleteQuestion);

router
  .route("/categories")
  .get(authorize("admin", "editor"), getAdminCategories)
  .post(authorize("admin", "editor"), createCategory);

router
  .route("/categories/:categoryId")
  .put(authorize("admin", "editor"), updateCategory)
  .delete(authorize("admin", "editor"), deleteCategory);

export default router;
