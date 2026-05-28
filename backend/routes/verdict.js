import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    const stockName = req.query.stock || "테스트종목";

    const youtubeScore = 84;
    const dartScore = 87;
    const riskScore = 28;

    let finalVerdict = "관망";
    let action = "분할매수 검토";

    if (youtubeScore >= 80 && dartScore >= 80 && riskScore <= 40) {
        finalVerdict = "심리와 실체가 함께 강한 보석 후보입니다.";
        action = "관심 구간";
    } else if (youtubeScore >= 80 && dartScore < 60) {
        finalVerdict =
            "심리는 뜨겁지만 실체가 약한 가짜 보석 위험이 있습니다.";
        action = "추격매수 주의";
    } else if (youtubeScore < 50 && dartScore >= 80) {
        finalVerdict =
            "시장 관심은 낮지만 실적은 강한 조용한 보석 후보입니다.";
        action = "관찰 강화";
    }

    res.json({
        ok: true,
        stockName,

        security: {
            apiKeysExposed: false,
            usesEnvOnly: true,
            autoTrading: false,
        },

        scores: {
            youtubeScore,
            dartScore,
            riskScore,
        },

        finalVerdict,
        action,

        disclaimer:
            "이 결과는 투자 참고용이며 매수·매도 확정 신호가 아닙니다.",
    });
});

export default router;