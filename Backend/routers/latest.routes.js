import express from "express";

import { getLatestData } from "../controllers/latest.controller.js";
import { generateId } from "../middlewares/filter.generateid.js";

const router = express.Router();

router.post("/latest", generateId, getLatestData);

export default router;