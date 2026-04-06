import express from "express";

import { generateId } from "../middlewares/filter.generateid.js";
import { getAggrigationData, getDelta, getRawData, getTags } from "../controllers/filter.controller.js";

const router = express.Router();

router.get("/tag", generateId, getTags);

router.post("/raw", generateId, getRawData);

router.post("/aggregation", generateId, getAggrigationData);

router.post("/delta", generateId, getDelta);

export default router;
