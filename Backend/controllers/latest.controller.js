import { prisma } from "../lib/prisma.js";

export const getLatestData = async (req, res) => {
  try {
    const { tags } = req.body;

    const data = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT ON (td.id)
        td.tag,
        td.id AS telemetry_id,
        h.value,
        h.quality,
        h.timestamp
      FROM "TelemetryData" td
      JOIN "History" h 
        ON h.telemetry_id = td.id
      WHERE td.tag = ANY($1)
      ORDER BY td.id, h.timestamp DESC;
    `, tags);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};