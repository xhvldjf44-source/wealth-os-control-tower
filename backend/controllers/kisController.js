import { getCurrentPrice as getKisCurrentPrice } from "../services/kisService.js";

export const testKisController = (req, res) => {
    res.json({
        success: true,
        message: "KIS Controller 연결 성공",
        layer: "controller",
    });
};

export const getCurrentPrice = async (req, res) => {
    try {
        const { code } = req.params;

        const data = await getKisCurrentPrice(code);

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("❌ 현재가 조회 실패:", error);

        return res.status(500).json({
            success: false,
            message: "현재가 조회 실패",
            error: error.message,
        });
    }
};