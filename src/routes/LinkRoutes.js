import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { body, query } from "express-validator";
import { addLink, getLinks, updateLink, deleteLink, countLinkClick, getLinkStats } from "../controllers/linkController.js";
import { upload } from "../middlewares/multerMiddleware.js";

const router = express.Router();

// =====================================================================================================================
// Link CRUD Operation
// =====================================================================================================================
router.post(
  "/",
  authMiddleware,
  upload.single("icon"),
  [
    body("creator").isLength({ min: 4 }).trim().escape().withMessage("Owner field is required."),
    body("title").isLength({ min: 3 }).trim().escape(),
    body("url").isLength({ min: 6 }).trim()
  ],
  addLink
);
router.get("/", authMiddleware, getLinks);
router.patch(
  "/:docId",
  authMiddleware,
  upload.single("icon"),
  [body("id").isLength({ min: 24 }).trim().escape(), body("title").isLength({ min: 3 }).trim().escape(), body("url").isLength({ min: 6 }).trim()],
  updateLink
);
router.delete("/:docId", authMiddleware, deleteLink);

// =====================================================================================================================
// Link Click Count Feature
// =====================================================================================================================
router.get("/stats", authMiddleware, getLinkStats);
router.patch("/click/:docId", countLinkClick);

export default router;
