import express from "express";

const router = express.Router();

router.get("/trends", (req, res) => {
    const mockTrends = [
        {
            keyword: "AI",
            sector: "인공지능 / 데이터센터",
            mentionCount: 42,
            momentumScore: 91,
            overheatingRisk: "보통",
            relatedStocks: ["삼성전자", "SK하이닉스", "한미반도체"],
            reason: "AI 데이터센터와 HBM 수요 증가 기대감",
        },
        {
            keyword: "전력설비",
            sector: "전력 / 인프라",
            mentionCount: 31,
            momentumScore: 84,
            overheatingRisk: "낮음",
            relatedStocks: ["HD현대일렉트릭", "LS ELECTRIC", "효성중공업"],
            reason: "AI 데이터센터 전력 수요 증가",
        },
        {
            keyword: "원전",
            sector: "에너지 / SMR",
            mentionCount: 24,
            momentumScore: 76,
            overheatingRisk: "보통",
            relatedStocks: ["두산에너빌리티", "한전기술", "우진"],
            reason: "전력 부족과 SMR 기대감",
        },
    ];

    res.json({
        ok: true,
        source: "mock-youtube-scanner",
        updatedAt: new Date().toISOString(),
        trends: mockTrends,
    });
});

export default router;