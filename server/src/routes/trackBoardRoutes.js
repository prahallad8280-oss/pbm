import express from "express";

import { getPublicTrackBoards } from "../controllers/trackBoardController.js";

const router = express.Router();

router.get("/", getPublicTrackBoards);

export default router;
