import express from "express";

import { getPublicNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getPublicNotifications);

export default router;

