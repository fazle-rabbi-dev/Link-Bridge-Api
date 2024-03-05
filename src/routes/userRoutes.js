import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, query } from "express-validator";
import {
  registerUser,
  login,
  loginWithSocial,
  confirmAccount,
  resetPassword,
  changePassword,
  getUserById,
  getLinktreeProfile,
  updateAccount,
  updateLinktreeProfileDesign
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

// =====================================================================================================================
// Authentication
// =====================================================================================================================
router.post(
  "/register",
  [
    body("name").isLength({ min: 4 }).trim().escape().withMessage("Name is required and must be at least 4 characters long."),
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim().escape()
  ],
  registerUser
);
router.post(
  "/login",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim().escape()
  ],
  login
);
router.post(
  "/login-with-social",
  [
    body("name").isLength({ min: 4 }).trim().escape(),
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim().escape(),
    body("authMethod").isLength({ min: 3 }).trim().escape(),
    body("providerAccessToken").isLength({ min: 3 }).trim().escape()
  ],
  loginWithSocial
);
router.get("/confirm-account", confirmAccount);
router.patch("/reset-password", resetPassword);
// router.patch("/change-password", authMiddleware, changePassword);

// =====================================================================================================================
// User Account Management
// =====================================================================================================================
router.get("/:userId", authMiddleware, getUserById);
router.get("/linktree-profile/:username", getLinktreeProfile);
// router.patch("/:userId", authMiddleware, upload.single("avatar"), updateAccount);
router.patch("/:userId", authMiddleware, updateAccount);
router.patch("/update/linktree-profile", authMiddleware, upload.single("file"), updateLinktreeProfileDesign);

export default router;