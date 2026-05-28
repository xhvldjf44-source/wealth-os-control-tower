import express from "express";
import { generateStrategicOS } from "../googleAiService";

const router = express.Router();

router.post("/strategic-os", async (req, res) => {
    try {
        const { query } = req.body;

        const result = await generateStrategicOS(query);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "AI 전략 분석 실패",
        });
    }
});

export default router;