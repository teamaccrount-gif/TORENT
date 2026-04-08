import { prisma } from "../lib/prisma.js";
import {
  logError,
  logEvent,
  logTransaction,
} from "../services/logs.service.js";

const fetchTable = (modelName) => async (req, res) => {
  try {
    await logEvent(req);

    const model = prisma[modelName];

    if (!model) {
      throw new Error(`Model '${modelName}' not found in Prisma`);
    }

    const data = await model.findMany();

    await logTransaction(req);

    res.status(200).json({ success: true, data });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getCountryTable = fetchTable("country");
export const getRegionTable = fetchTable("region");
export const getAreaTable = fetchTable("area");
export const getCgsTable = fetchTable("cgs");
export const getStationTable = fetchTable("station");
export const getCompressorTable = fetchTable("compressor");
export const getDispenserTable = fetchTable("dispenser");
export const getDeviceTable = fetchTable("device");
export const getPngTable = fetchTable("png");
export const getLcngTable = fetchTable("lcng");
export const getDrsTable = fetchTable("drs");
export const getIndustrialTable = fetchTable("industrial");
export const getCommercialTable = fetchTable("commercial");
export const getDomesticTable = fetchTable("domestic");
