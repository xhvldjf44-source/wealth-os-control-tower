import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "KIS routes 연결 성공",
        time: new Date().toISOString(),
    });
});

export default router;