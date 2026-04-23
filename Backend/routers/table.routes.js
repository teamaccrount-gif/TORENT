import express from "express";

import { generateId } from "../middlewares/generateid.js";
import { authenticate } from "../middlewares/authenticate.js";
import { applyLevelAccess } from "../middlewares/levelAccess.js";
import {
  getCountryTable,
  getRegionTable,
  getAreaTable,
  getCgsTable,
  getStationTable,
  getCompressorTable,
  getDispenserTable,
  getDeviceTable,
  getPngTable,
  getLcngTable,
  getDrsTable,
  getIndustrialTable,
  getCommercialTable,
  getDomesticTable,
} from "../controllers/table.controller.js";

const router = express.Router();

router.get("/country", generateId, getCountryTable);
router.get("/region", generateId, getRegionTable);
router.get("/area", generateId, getAreaTable);
router.get("/cgs", generateId, getCgsTable);
router.get("/station", generateId, getStationTable);
router.get("/compressor", generateId, getCompressorTable);
router.get("/dispenser", generateId, getDispenserTable);
router.get("/device", generateId, getDeviceTable);
router.get("/png", generateId, getPngTable);
router.get("/lcng", generateId, getLcngTable);
router.get("/drs", generateId, getDrsTable);
router.get("/industrial", generateId, getIndustrialTable);
router.get("/commercial", generateId, getCommercialTable);
router.get("/domestic", generateId, getDomesticTable);

export default router;
