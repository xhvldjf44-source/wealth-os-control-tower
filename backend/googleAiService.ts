import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateStrategicOS(query: string) {
    const prompt = `
너는 Wealth Jewel OS의 산업 흐름 전략 엔진이다.

절대 GPT처럼 긴 설명을 하지 마라.

너의 역할은:
"돈의 흐름 구조"
"산업 연결"
"보석주 가능성"
"리스크 제어"
를 JSON으로 반환하는 것이다.

분석 대상:
${query}

출력 규칙:

1. 반드시 JSON만 출력
2. 설명 금지
3. 마크다운 금지
4. 코드블럭 금지
5. 투자 초보도 한눈에 이해 가능해야 함
6. 실제 최신 뉴스 기반으로 판단
7. 산업 흐름 연결 구조 중심
8. 추격매수 위험 반드시 포함

반드시 아래 JSON 구조로 출력:

{
  "name": "기업명",
  "ticker": "티커",
  "price": 0,
  "change": 0,
  "changeRate": 0,
  "isRealtime": true,

  "industrySignals": [
    {
      "label": "AI / 데이터센터",
      "status": "strong"
    },
    {
      "label": "반도체 / HBM",
      "status": "strong"
    },
    {
      "label": "원전 / SMR",
      "status": "neutral"
    }
  ],

  "industryFlow": [
    "AI 데이터센터 증가",
    "HBM 수요 증가",
    "패키징 병목 발생",
    "장비 투자 확대 가능"
  ],

  "jewelScore": {
    "total": 87,
    "growth": 88,
    "moneyFlow": 85,
    "earnings": 81,
    "theme": 90,
    "stability": 83
  },

  "riskControl": {
    "chaseBuyRisk": "high",
    "strategy": "3분할 매수",
    "cashRatio": "30% 이상",
    "stopLoss": "-7%",
    "marketMood": "공포 구간 주의"
  },

  "checklist": [
    {
      "label": "거래량 증가",
      "checked": true
    },
    {
      "label": "기관 순매수",
      "checked": true
    },
    {
      "label": "실적 개선",
      "checked": false
    },
    {
      "label": "20일선 회복",
      "checked": true
    }
  ],

  "positionStatus": {
    "stage": "초기 관심 단계",
    "summary": "실적 검증 진행 중",
    "warning": "추격매수 금지"
  },

  "hiddenGem": {
    "whyNotMove": "아직 기관 대량 매집 전",
    "trigger": "실적 상향 시 재평가 가능"
  },

  "aiInsight": "핵심 투자 판단 한줄"
}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,

        config: {
            temperature: 0.3,

            tools: [
                {
                    googleSearch: {},
                },
            ],
        },
    });

    const text = response.text || "";

    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        console.error("JSON Parse Error:", error);

        return {
            name: query,
            ticker: "UNKNOWN",
            price: 0,
            change: 0,
            changeRate: 0,
            isRealtime: true,

            industrySignals: [],

            industryFlow: [
                "AI 분석 구조화 실패",
                "Gemini 응답 확인 필요",
            ],

            jewelScore: {
                total: 50,
                growth: 50,
                moneyFlow: 50,
                earnings: 50,
                theme: 50,
                stability: 50,
            },

            riskControl: {
                chaseBuyRisk: "medium",
                strategy: "관망",
                cashRatio: "현금 유지",
                stopLoss: "-5%",
                marketMood: "데이터 부족",
            },

            checklist: [],

            positionStatus: {
                stage: "분석 실패",
                summary: "Gemini 응답 확인 필요",
                warning: "재시도 필요",
            },

            hiddenGem: {
                whyNotMove: "데이터 부족",
                trigger: "재분석 필요",
            },

            aiInsight: "AI 분석 실패",
        };
    }
}