import express from "express";
import multer from "multer";
import { verifyUser } from "../controllers/authController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/verify", upload.single("photo"), verifyUser);

export default router;
