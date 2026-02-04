import jwt from "jsonwebtoken";
import { checkGenderWithAI } from "../services/aiService.js";

export const verifyUser = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    const { fingerprint } = req.body;

    // 1. Call Service
    const aiResult = await checkGenderWithAI(req.file.buffer);

    // Clear buffer for security
    req.file.buffer.fill(0);

    console.log(`✅ Controller: Gender verified as ${aiResult.gender}`);

    // 3. Issue Token
    const token = jwt.sign(
      { id: fingerprint, gender: aiResult.gender },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "2h" },
    );

    res.json({ token, gender: aiResult.gender });
  } catch (error) {
    console.error("Auth Controller Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
