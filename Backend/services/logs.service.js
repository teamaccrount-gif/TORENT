import { prisma } from "../lib/prisma.js";

export const logEvent = async(req) => {
    await prisma.eventLog.create({
    data: {
      username: req.user?.name || "anonymous",
      endpoint: `http://localhost:3000${req.originalUrl}`,
      method: req.method,
      params: req.body || req.query || req.params
    }
  });
}

export const logTransaction = async(req) => {
  await prisma.transactionLog.create({
    data: {
      username: req.user?.name || "anonymous",
      endpoint: `http://localhost:3000${req.originalUrl}`
    }
  });
}

export const logError = async(req, err) => {
  await prisma.errorLog.create({
    data: {
      username: req.user?.name || "anonymous",
      endpoint: `http://localhost:3000${req.originalUrl}`,
      error: err.message
    }
  });
}