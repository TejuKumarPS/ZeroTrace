import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const checkGenderWithAI = async (fileBuffer) => {
  try {
    const formData = new FormData();
    formData.append("file", fileBuffer, "upload.jpg");

    console.log("📡 Service: Calling Python AI Service...");

    const response = await axios.post(`${AI_URL}/analyze-gender`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    console.error("❌ AI Service Error:", error.message);

    if (error.response) {
      throw new Error(error.response.data.detail || "AI Processing Failed");
    }
    throw new Error("AI Service Unreachable");
  }
};
