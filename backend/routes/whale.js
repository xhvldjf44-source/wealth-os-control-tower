import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    const stock = req.query.stock || "테스트종목";

    res.json({
        ok: true,
        stock,
        whaleSignal: "감지",
        foreignFlow: "+120억",
        institutionFlow: "+85억",
        volumeSpike: "3.8배",
        risk: "보통",
        verdict: "기관 초기 매집 가능성",
        strategy: "분할 관찰 매수",
        warning: "추격매수 금지"
    });
});

export default router;