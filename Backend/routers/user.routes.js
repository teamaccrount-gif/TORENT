import express from "express";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { generateId } from "../middlewares/filter.generateid.js";

const router = express.Router();

router.get("/", generateId, authenticate, authorize("edit_user"), getUsers);
router.post(
  "/",
  generateId,
  authenticate,
  authorize("create_user"),
  createUser,
);
router.put(
  "/:id",
  generateId,
  authenticate,
  authorize("edit_user"),
  updateUser,
);
router.delete(
  "/:id",
  generateId,
  authenticate,
  authorize("delete_user"),
  deleteUser,
);

export default router;
