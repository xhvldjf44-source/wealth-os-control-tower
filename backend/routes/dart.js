import express from "express";

const router = express.Router();

router.get("/check", (req, res) => {
    const stockName = req.query.stock || "테스트종목";

    res.json({
        ok: true,
        source: "mock-dart-check",
        stockName,
        dartValidation: {
            revenueGrowth: 18.4,
            operatingProfitGrowth: 32.7,
            roe3YearAvg: 16.2,
            debtRatio: 78.5,
            dilutionRisk: false,
            profitStatus: "흑자",
            realValueScore: 87,
            verdict: "실적이 받쳐주는 알짜 후보",
        },
    });
});

export default router;