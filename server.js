import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = process.env.PORT || 4000;
const GARDEN_SHOP_URL =
    process.env.GARDEN_SHOP_URL || "https://gardenstudio.co.kr";

app.use(cors());
app.use(express.json());

function cleanText(text = "") {
    return String(text).replace(/\s+/g, " ").trim();
}

function getToday() {
    return new Date().toISOString().slice(0, 10);
}

async function fetchNews(keyword) {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
        return [
            {
                title: `${keyword} 산업 흐름 점검`,
                description:
                    "AI, 반도체, 전력, 데이터센터, 원전, 글로벌 주식시장의 연결성이 강화되고 있습니다.",
                url: "https://news.google.com",
                source: { name: "Demo Source" },
                publishedAt: getToday(),
            },
            {
                title: `${keyword} 관련 투자 관점`,
                description:
                    "단기 테마보다 실적, 수급, 현금흐름, 산업 확장성을 함께 확인해야 합니다.",
                url: "https://finance.yahoo.com",
                source: { name: "Demo Finance" },
                publishedAt: getToday(),
            },
        ];
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        keyword
    )}&language=ko&pageSize=8&sortBy=publishedAt&apiKey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    return data.articles || [];
}

function buildSources(articles = []) {
    return articles.slice(0, 6).map((a, i) => ({
        no: i + 1,
        title: cleanText(a.title),
        summary: cleanText(a.description || "요약 없음"),
        source: a.source?.name || "Unknown",
        url: a.url || "",
        publishedAt: a.publishedAt || "",
    }));
}

function detectIndustry(keyword = "") {
    const k = keyword.toLowerCase();

    if (k.includes("반도체") || k.includes("hbm") || k.includes("삼성")) {
        return "AI 반도체 / HBM / 데이터센터";
    }
    if (k.includes("원전") || k.includes("smr") || k.includes("전력")) {
        return "원전 / SMR / 전력 인프라";
    }
    if (k.includes("로봇")) return "로봇 / 자동화";
    if (k.includes("바이오")) return "바이오 / 헬스케어";
    if (k.includes("방산")) return "방산 / 안보";
    if (k.includes("양자")) return "양자컴퓨터";
    if (k.includes("버핏") || k.includes("워렌")) return "장기 가치투자";
    if (k.includes("성경")) return "성경 지혜 / 멘탈 OS";

    return "AI / 글로벌 성장산업";
}

function makeInvestmentReport(keyword, sources) {
    const industry = detectIndustry(keyword);

    return {
        title: `${keyword} 투자 전략 리포트`,
        date: getToday(),
        industry,
        conclusion:
            `${keyword}는 현재 ${industry} 흐름 안에서 해석해야 합니다. 단기 급등보다 실적, 수급, 산업 지속성을 함께 확인하는 전략이 필요합니다.`,
        actionPlan: [
            "1차: 뉴스 재료와 실제 실적 연결 여부 확인",
            "2차: 기관·외국인 수급 변화 확인",
            "3차: 고점 추격 금지, 3분할 접근",
            "4차: 손절 기준은 -7% 내외로 사전 설정",
            "5차: 장기 성장성은 산업 확장성과 현금흐름으로 판단",
        ],
        analysis: {
            currentPosition:
                "현재는 관심 구간입니다. 다만 단순 테마 상승인지, 실적 기반 상승인지 구분해야 합니다.",
            growthDrivers: [
                "AI 데이터센터 확대",
                "전력 수요 증가",
                "반도체·인프라 투자 확대",
                "글로벌 공급망 재편",
                "기관 자금의 성장산업 선호",
            ],
            risks: [
                "단기 과열 후 조정 가능성",
                "실적 없는 테마성 급등 위험",
                "금리 상승 시 성장주 밸류에이션 부담",
                "외국인 매도 전환 가능성",
                "뉴스 기대감과 실제 매출 사이의 괴리",
            ],
            strategy3M:
                "3개월 관점에서는 뉴스와 수급 반응이 중요합니다. 추격매수보다 눌림목 확인이 유리합니다.",
            strategy6M:
                "6개월 관점에서는 실적 전망, 수주, 가이던스 변화가 핵심입니다.",
            strategy1Y:
                "1년 관점에서는 산업 내 구조적 수혜 여부와 시장 지배력을 확인해야 합니다.",
            finalGrade: "관심 / 분할매수 후보",
        },
        sources,
        disclaimer:
            "본 리포트는 투자 참고 자료이며 매수·매도 결정은 본인의 책임입니다.",
    };
}

function makeBlog(keyword, sources) {
    const industry = detectIndustry(keyword);

    return {
        title: `${keyword}, 지금 주목해야 하는 이유`,
        seoKeywords: [
            keyword,
            industry,
            "AI 투자",
            "미래산업",
            "부의보석 AI OS",
            "장기투자",
        ],
        content: `
# ${keyword}, 지금 주목해야 하는 이유

${keyword}는 단순한 검색어가 아니라 앞으로 자본이 이동할 수 있는 하나의 신호입니다.  
특히 ${industry} 흐름과 연결될 경우, 시장은 단기 뉴스보다 장기적인 산업 구조 변화를 더 크게 반영할 수 있습니다.

## 1. 핵심 흐름

현재 시장은 AI, 데이터센터, 반도체, 전력, 원전, 자동화 산업이 서로 연결되는 방향으로 움직이고 있습니다.  
하나의 산업만 보는 것이 아니라 돈이 이동하는 길을 봐야 합니다.

## 2. 투자자가 봐야 할 포인트

첫째, 뉴스가 실제 매출로 연결되는지 확인해야 합니다.  
둘째, 기관과 외국인의 수급이 동반되는지 봐야 합니다.  
셋째, 단기 급등보다 장기 성장성을 기준으로 판단해야 합니다.

## 3. 리스크

좋은 산업도 비싸게 사면 위험합니다.  
테마가 강할수록 추격매수 위험도 커집니다.  
따라서 분할매수, 현금 비중, 손절 기준은 반드시 필요합니다.

## 4. 결론

${keyword}는 관심을 가질 만한 주제입니다.  
그러나 진짜 부자는 빠르게 따라가는 사람이 아니라, 근거를 확인하고 기다릴 줄 아는 사람입니다.
    `.trim(),
        sources,
    };
}

function makeSNS(keyword) {
    return {
        shortPost: `
${keyword}, 지금 단순 뉴스로 보면 늦습니다.

진짜 핵심은  
AI → 데이터센터 → 전력 → 반도체 → 인프라 → 수익화 흐름입니다.

추격매수보다 중요한 것:
근거 확인, 분할매수, 리스크 관리.

부의보석 AI OS가 오늘의 흐름을 분석합니다.
    `.trim(),
        hashtags: [
            `#${keyword.replace(/\s+/g, "")}`,
            "#AI투자",
            "#미래산업",
            "#장기투자",
            "#부의보석AIOS",
            "#디지털자산",
            "#수익화시스템",
        ],
        cta: "지금 검색하고, 분석하고, 상품으로 연결하세요.",
    };
}

function makeSummary(keyword, sources) {
    return {
        title: `${keyword} 핵심 요약`,
        summary: [
            `${keyword}는 ${detectIndustry(keyword)} 흐름과 연결해서 봐야 합니다.`,
            "단기 뉴스보다 실적, 수급, 산업 확장성이 더 중요합니다.",
            "추격매수보다 분할 접근이 유리합니다.",
            "출처 확인 후 투자·콘텐츠·상품화로 연결하는 전략이 필요합니다.",
        ],
        keyRisks: [
            "테마 과열",
            "실적 미반영",
            "금리 부담",
            "수급 이탈",
            "뉴스 기대감 소멸",
        ],
        sources,
    };
}

function makeProduct(keyword, category, customerType) {
    const productName = `부의보석 ${keyword} 프리미엄 AI 리포트`;

    return {
        productName,
        category: category || "AI 투자 리포트",
        customerType:
            customerType || "전략적 투자자 · 지식 성장형 사용자 · 디지털 구매자",
        description: `
${keyword}를 중심으로 투자 분석, 산업 흐름, 리스크, 블로그 콘텐츠, SNS 홍보 문구까지 한 번에 정리한 프리미엄 디지털 상품입니다.

이 상품은 단순 정보가 아니라 검색을 수익화 구조로 연결하기 위해 설계되었습니다.

포함 내용:
- 투자 전략 리포트
- 산업 흐름 분석
- 리스크 체크리스트
- 블로그 콘텐츠
- SNS 홍보 문구
- 구매 행동 유도 문장
    `.trim(),
        marketingText: `
${keyword}를 검색했다면 이제 정보에서 멈추지 마세요.

부의보석 AI OS는 검색을 분석으로, 분석을 콘텐츠로, 콘텐츠를 상품으로, 상품을 수익으로 연결합니다.

지금 필요한 것은 더 많은 정보가 아니라 실행 가능한 구조입니다.
    `.trim(),
        priceSuggestion: "9,900원 ~ 49,000원",
        purchaseUrl: `${GARDEN_SHOP_URL}?keyword=${encodeURIComponent(
            keyword
        )}&product=${encodeURIComponent(productName)}`,
    };
}

app.get("/", (req, res) => {
    res.json({
        name: "부의보석 AI OS",
        status: "running",
        message: "지능형 콘텐츠·투자·상품화 엔진 작동 중",
    });
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "부의보석 AI OS 서버 정상 작동" });
});

app.get("/api/news", async (req, res) => {
    try {
        const keyword = req.query.q || "AI 반도체";
        const articles = await fetchNews(keyword);

        res.json({
            ok: true,
            keyword,
            articles,
            sources: buildSources(articles),
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "뉴스 수집 실패",
            error: error.message,
        });
    }
});

app.post("/api/investment-report", async (req, res) => {
    try {
        const { keyword = "AI 반도체" } = req.body;
        const articles = await fetchNews(keyword);
        const sources = buildSources(articles);
        const report = makeInvestmentReport(keyword, sources);

        res.json({
            ok: true,
            keyword,
            report,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "투자 분석 리포트 생성 실패",
            error: error.message,
        });
    }
});

app.post("/api/blog", async (req, res) => {
    try {
        const { keyword = "AI 반도체" } = req.body;
        const articles = await fetchNews(keyword);
        const sources = buildSources(articles);
        const blog = makeBlog(keyword, sources);

        res.json({
            ok: true,
            keyword,
            blog,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "블로그 글 생성 실패",
            error: error.message,
        });
    }
});

app.post("/api/sns", async (req, res) => {
    try {
        const { keyword = "AI 반도체" } = req.body;
        const sns = makeSNS(keyword);

        res.json({
            ok: true,
            keyword,
            sns,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "SNS 홍보물 생성 실패",
            error: error.message,
        });
    }
});

app.post("/api/summary", async (req, res) => {
    try {
        const { keyword = "AI 반도체" } = req.body;
        const articles = await fetchNews(keyword);
        const sources = buildSources(articles);
        const summary = makeSummary(keyword, sources);

        res.json({
            ok: true,
            keyword,
            summary,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "콘텐츠 요약 실패",
            error: error.message,
        });
    }
});

app.post("/api/generate-product", async (req, res) => {
    try {
        const {
            keyword = "AI 반도체",
            category = "AI 투자 리포트",
            customerType = "전략적 투자자",
        } = req.body;

        const product = makeProduct(keyword, category, customerType);

        res.json({
            ok: true,
            keyword,
            product,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "AI 상품 생성 실패",
            error: error.message,
        });
    }
});

app.post("/api/checkout", (req, res) => {
    const { productName, keyword } = req.body;

    const checkoutUrl = `${GARDEN_SHOP_URL}?keyword=${encodeURIComponent(
        keyword || "AI"
    )}&product=${encodeURIComponent(productName || "부의보석 AI 상품")}`;

    res.json({
        ok: true,
        checkoutUrl,
    });
});

app.post("/api/full-engine", async (req, res) => {
    try {
        const {
            keyword = "AI 반도체",
            category = "AI 투자 리포트",
            customerType = "전략적 투자자",
        } = req.body;

        const articles = await fetchNews(keyword);
        const sources = buildSources(articles);

        res.json({
            ok: true,
            keyword,
            sources,
            investmentReport: makeInvestmentReport(keyword, sources),
            blog: makeBlog(keyword, sources),
            sns: makeSNS(keyword),
            summary: makeSummary(keyword, sources),
            product: makeProduct(keyword, category, customerType),
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: "부의보석 AI 풀엔진 실행 실패",
            error: error.message,
        });
    }
});


// ✅ 여기 넣는다 (440번 자리)

// ----------------------
// 🧠 고급 투자 분석 엔진
// ----------------------

function makeInvestmentReport(keyword, sources) {
    return `투자리포트`;
}

function makeSEO(keyword) {
    return {
        title: `${keyword} 분석`,
        description: `${keyword} 설명`,
        tags: [keyword]
    };
}

// ----------------------

app.listen(PORT, () => {
    console.log(`✅ 부의보석 AI OS 서버 실행 중: http://localhost:${PORT}`);
});
app.listen(PORT, () => {
    console.log(`✅ 부의보석 AI OS 서버 실행 중: http://localhost:${PORT}`);
});
