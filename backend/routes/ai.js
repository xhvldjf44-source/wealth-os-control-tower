import express from "express";
import { askAI } from "../services/AIAgentService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { message } = req.body;

        const result = await askAI(message);

        res.json({
            success: true,
            response: result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "AI 서버 오류",
        });
    }
});

export default router;