import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt.js";
import { logError, logEvent, logTransaction } from "../services/logs.service.js";


export const login = async (req, res) => {
  try {
    await logEvent(req);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            role_permissions: {
              include: { permission: true },
            },
          },
        },
        access: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const permissions = user.role.role_permissions.map((rp) => rp.permission.name);

    const tokenPayload = {
      user_id:  user.id,
      role:     user.role.name,
      level:    user.access?.level || null,
      permissions,
    };

    const accessToken  = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ user_id: user.id });

    await prisma.refreshToken.create({
      data: {
        token:      refreshToken,
        user_id:    user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    await logTransaction(req);

    res.status(200).json({
      success: true,
      data: {
        access_token:  accessToken,
        refresh_token: refreshToken,
        user: {
          id:          user.id,
          email:       user.email,
          phone:       user.phone,
          role:        user.role.name,
          level:       user.access?.level || null,
          permissions,
        },
      },
    });
  } catch (err) {
    await logError(req, err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, error: "Refresh token required" });
    }

    // verify token signature
    const decoded = verifyRefreshToken(refresh_token);

    // check if token exists in db and is not expired
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refresh_token },
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      return res.status(401).json({ success: false, error: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.user_id },
      include: {
        role: {
          include: {
            role_permissions: {
              include: { permission: true },
            },
          },
        },
        access: true,
      },
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: "User not found or inactive" });
    }

    const permissions = user.role.role_permissions.map((rp) => rp.permission.name);

    const newAccessToken = generateAccessToken({
      user_id:     user.id,
      role:        user.role.name,
      level:       user.access?.level || null,
      permissions,
    });

    res.status(200).json({
      success: true,
      data: { access_token: newAccessToken },
    });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid refresh token" });
  }
};


export const logout = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, error: "Refresh token required" });
    }

    await prisma.refreshToken.delete({
      where: { token: refresh_token },
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};