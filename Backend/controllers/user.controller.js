import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma.js";
import { logError, logEvent, logTransaction } from "../services/logs.service.js";

export const createUser = async (req, res) => {
  try {
    await logEvent(req);

    const { email, password, phone, role_id, level, regions, areas, stations } = req.body;

    if (!email || !password || !role_id || !level) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        role_id,
        access: {
          create: {
            level,
            regions:  regions  || [],
            areas:    areas    || [],
            stations: stations || [],
          },
        },
      },
      include: { role: true, access: true },
    });

    await logTransaction(req);

    res.status(201).json({
      success: true,
      data: {
        id:     user.id,
        email:  user.email,
        phone:  user.phone,
        role:   user.role.name,
        access: user.access,
      },
    });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    await logEvent(req);

    const users = await prisma.user.findMany({
      select: {
        id:         true,
        email:      true,
        phone:      true,
        is_active:  true,
        created_at: true,
        role:       { select: { name: true } },
        access:     true,
      },
    });

    await logTransaction(req);

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    await logEvent(req);

    const { id } = req.params;
    const { email, phone, role_id, is_active, level, regions, areas, stations } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        phone,
        role_id,
        is_active,
        access: {
          update: {
            level,
            regions:  regions  || [],
            areas:    areas    || [],
            stations: stations || [],
          },
        },
      },
      include: { role: true, access: true },
    });

    await logTransaction(req);

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await logEvent(req);

    const { id } = req.params;

    await prisma.user.delete({ where: { id: parseInt(id) } });

    await logTransaction(req);

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};