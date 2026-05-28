import { GoogleGenAI } from "@google/genai";

export type GeminiStrategyMap = {
    industryFlow: string;
    keyPoint: string;
    watchPoint: string;
    risk: string;
};

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function generateGeminiStrategyMap(
    stockName: string
): Promise<GeminiStrategyMap> {
    if (!stockName || stockName.trim().length === 0) {
        throw new Error("종목명 또는 산업 키워드가 필요합니다.");
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
    }

    const prompt = `
너는 30년 경력의 월가 투자 전략가이자, 한국 주식 초보자를 위한 AI 투자 관제 시스템이다.

사용자가 입력한 종목 또는 산업 키워드:
"${stockName}"

너의 임무는 단순 설명이 아니다.
주식 초보자가 "이 종목을 왜 봐야 하는지, 지금 사도 되는지, 무엇을 확인해야 하는지" 이해할 수 있도록
아주 구체적인 전략 리포트를 작성해야 한다.

반드시 아래 관점으로 분석하라.

1. 이 종목이 어떤 산업 흐름에 연결되는가?
2. AI / 반도체 / 전력 / 원전 / 데이터센터 / 로봇 / 방산 / 바이오 / 양자컴퓨터 중 어떤 미래 산업과 연결되는가?
3. 흙속의 진주 가능성이 있는가?
4. 아직 덜 알려진 이유는 무엇인가?
5. 상승하려면 어떤 조건이 필요한다?
6. 주식 초보자가 지금 바로 매수하면 위험한가?
7. 반드시 확인해야 할 숫자, 공시, 수급, 거래량, 실적 포인트는 무엇인가?
8. 결론은 매수 / 관망 / 분할관심 중 무엇인가?

주의:
- 모르는 사실을 지어내지 마라.
- 실시간 주가, 실적, 수급을 확실히 모르면 "확인 필요"라고 말하라.
- 무조건 추천하지 마라.
- 초보자가 이해할 수 있게 써라.
- 두루뭉실한 표현 금지.
- 각 항목은 5~8문장으로 구체적으로 작성하라.
- 반드시 투자 판단 문장을 포함하라.

반드시 아래 JSON 형식만 반환하라.
마크다운, 코드블록, 설명문은 절대 포함하지 마라.

{
  "industryFlow": "이 종목이 연결된 산업 흐름을 설명한다. AI 시대 돈의 흐름과 연결 가능성이 있으면 연결 구조를 단계별로 설명한다. 예: AI 데이터센터 증가 → 전력 수요 증가 → 광통신/전력설비/냉각 수요 증가. 단, 확실하지 않은 부분은 확인 필요라고 말한다.",
  "keyPoint": "이 종목을 보는 핵심 이유를 설명한다. 숨은 보석 가능성이 있다면 왜 그런지, 아직 대중 관심이 낮은 이유, 실제 실적주인지 단순 테마주인지 구분한다. 초보자가 이해할 수 있도록 이 회사가 무엇으로 돈을 버는지부터 설명한다.",
  "watchPoint": "앞으로 반드시 확인해야 할 체크리스트를 제시한다. 매출 증가, 영업이익 흑자전환, 수주 공시, 기관/외국인 수급, 거래량 증가, 20일선 회복, 전고점 돌파 여부 등을 구체적으로 말한다. 초보자가 HTS나 뉴스에서 무엇을 봐야 하는지 알려준다.",
  "risk": "지금 매수할 때의 위험을 냉정하게 설명한다. 실적 부진, 테마만 있고 숫자가 없는 경우, 거래량 없는 상승, 세력성 급등, 적자 지속, 유상증자 가능성, 추격매수 위험을 설명한다. 마지막에는 매수/관망/분할관심 중 하나의 판단을 제시한다."
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const rawText = response.text || "";

    try {
        const cleanedText = rawText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const parsed = JSON.parse(cleanedText);

        return {
            industryFlow:
                parsed.industryFlow ||
                "산업 흐름 분석이 부족합니다. 종목명과 산업 키워드를 더 구체적으로 입력해야 합니다.",
            keyPoint:
                parsed.keyPoint ||
                "핵심 포인트 분석이 부족합니다. 회사의 사업 구조, 실적, 수급 확인이 필요합니다.",
            watchPoint:
                parsed.watchPoint ||
                "관찰 포인트가 부족합니다. 거래량, 수급, 공시, 실적 변화를 확인해야 합니다.",
            risk:
                parsed.risk ||
                "리스크 분석이 부족합니다. 초보자는 추격매수를 피하고 분할 접근해야 합니다.",
        };
    } catch (error) {
        return {
            industryFlow:
                "Gemini 응답을 구조화하지 못했습니다. 다만 이 종목은 산업 연결성, 실적, 수급, 거래량을 따로 점검해야 합니다.",
            keyPoint: rawText.slice(0, 700),
            watchPoint:
                "확인할 항목: 최근 매출 증가 여부, 영업이익 흑자 여부, 수주 공시, 기관/외국인 수급, 거래량 증가, 20일선 회복 여부.",
            risk:
                "AI 응답 형식 오류가 발생했습니다. 투자 판단 전 반드시 실적, 공시, 차트, 수급을 직접 확인해야 합니다.",
        };
    }
}