import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const KIS_BASE_URL =
    process.env.KIS_BASE_URL || "https://openapi.koreainvestment.com:9443";

const KIS_APP_KEY = process.env.KIS_APP_KEY;
const KIS_APP_SECRET = process.env.KIS_APP_SECRET;

let accessToken = null;
let tokenExpiredAt = 0;

/**
 * 보석주 후보군
 * 지금은 안정적 테스트용.
 * 나중에 이 리스트를 50~200개로 늘리면 TOP5 품질이 크게 올라갑니다.
 */
const GEM_UNIVERSE = [
    { code: "005930", name: "삼성전자", theme: "반도체" },
    { code: "000660", name: "SK하이닉스", theme: "반도체" },
    { code: "042700", name: "한미반도체", theme: "반도체" },
    { code: "036930", name: "주성엔지니어링", theme: "반도체" },

    { code: "010120", name: "LS ELECTRIC", theme: "전력" },
    { code: "267260", name: "HD현대일렉트릭", theme: "전력" },
    { code: "103590", name: "일진전기", theme: "전력" },

    { code: "034020", name: "두산에너빌리티", theme: "원전" },
    { code: "051600", name: "한전KPS", theme: "원전" },

    { code: "277810", name: "레인보우로보틱스", theme: "로봇" },
    { code: "108490", name: "로보티즈", theme: "로봇" },

    { code: "012450", name: "한화에어로스페이스", theme: "방산" },
    { code: "064350", name: "현대로템", theme: "방산" },
];

function toNumber(value) {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/,/g, "").trim();
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
}

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiredAt) {
        return accessToken;
    }

    const res = await axios.post(`${KIS_BASE_URL}/oauth2/tokenP`, {
        grant_type: "client_credentials",
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
    });

    accessToken = res.data.access_token;
    tokenExpiredAt = Date.now() + 1000 * 60 * 60 * 20;

    return accessToken;
}

async function kisGet(path, trId, params) {
    const token = await getAccessToken();

    const res = await axios.get(`${KIS_BASE_URL}${path}`, {
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
            appkey: KIS_APP_KEY,
            appsecret: KIS_APP_SECRET,
            tr_id: trId,
            custtype: "P",
        },
        params,
        timeout: 10000,
    });

    return res.data;
}

/**
 * 현재가
 */
async function fetchPrice(stock) {
    const data = await kisGet(
        "/uapi/domestic-stock/v1/quotations/inquire-price",
        "FHKST01010100",
        {
            FID_COND_MRKT_DIV_CODE: "J",
            FID_INPUT_ISCD: stock.code,
        }
    );

    const o = data.output || {};

    return {
        code: stock.code,
        name: stock.name,
        theme: stock.theme,
        price: toNumber(o.stck_prpr),
        changeRate: toNumber(o.prdy_ctrt),
        volume: toNumber(o.acml_vol),
        tradingValue: toNumber(o.acml_tr_pbmn),
        high: toNumber(o.stck_hgpr),
        low: toNumber(o.stck_lwpr),
        open: toNumber(o.stck_oprc),
    };
}

/**
 * 일봉 데이터
 */
async function fetchDaily(stock) {
    const data = await kisGet(
        "/uapi/domestic-stock/v1/quotations/inquire-daily-price",
        "FHKST01010400",
        {
            FID_COND_MRKT_DIV_CODE: "J",
            FID_INPUT_ISCD: stock.code,
            FID_PERIOD_DIV_CODE: "D",
            FID_ORG_ADJ_PRC: "0",
        }
    );

    const rows = data.output || [];

    const closes = rows.map((r) => toNumber(r.stck_clpr)).filter((v) => v > 0);
    const volumes = rows.map((r) => toNumber(r.acml_vol)).filter((v) => v > 0);

    const ma5 =
        closes.slice(0, 5).reduce((a, b) => a + b, 0) /
        Math.max(closes.slice(0, 5).length, 1);

    const ma20 =
        closes.slice(0, 20).reduce((a, b) => a + b, 0) /
        Math.max(closes.slice(0, 20).length, 1);

    const avgVolume20 =
        volumes.slice(0, 20).reduce((a, b) => a + b, 0) /
        Math.max(volumes.slice(0, 20).length, 1);

    const today = rows[0] || {};

    return {
        ma5: Math.round(ma5),
        ma20: Math.round(ma20),
        avgVolume20: Math.round(avgVolume20),
        todayOpen: toNumber(today.stck_oprc),
        todayHigh: toNumber(today.stck_hgpr),
        todayLow: toNumber(today.stck_lwpr),
        todayClose: toNumber(today.stck_clpr),
        dailyRows: rows,
    };
}

/**
 * 투자자 수급
 */
async function fetchInvestor(stock) {
    try {
        const data = await kisGet(
            "/uapi/domestic-stock/v1/quotations/inquire-investor",
            "FHKST01010900",
            {
                FID_COND_MRKT_DIV_CODE: "J",
                FID_INPUT_ISCD: stock.code,
            }
        );

        const rows = data.output || [];

        const parsedRows = rows.map((row) => {
            const foreignNetBuy =
                toNumber(row.frgn_ntby_qty) ||
                toNumber(row.frgn_ntby_vol) ||
                toNumber(row.frgn_ntby_tr_pbmn);

            const institutionNetBuy =
                toNumber(row.orgn_ntby_qty) ||
                toNumber(row.inst_ntby_qty) ||
                toNumber(row.orgn_ntby_tr_pbmn);

            const personalNetBuy =
                toNumber(row.prsn_ntby_qty) ||
                toNumber(row.indv_ntby_qty) ||
                toNumber(row.prsn_ntby_tr_pbmn);

            return {
                investorDate: row.stck_bsop_date || row.bsop_date || "",
                foreignNetBuy,
                institutionNetBuy,
                personalNetBuy,
                raw: row,
            };
        });

        const latest = parsedRows[0] || {
            investorDate: "",
            foreignNetBuy: 0,
            institutionNetBuy: 0,
            personalNetBuy: 0,
        };

        return {
            investorDate: latest.investorDate,
            foreignNetBuy: latest.foreignNetBuy,
            institutionNetBuy: latest.institutionNetBuy,
            personalNetBuy: latest.personalNetBuy,
            investorRows: parsedRows,
        };
    } catch (error) {
        return {
            investorDate: "",
            foreignNetBuy: 0,
            institutionNetBuy: 0,
            personalNetBuy: 0,
            investorRows: [],
            investorError: true,
        };
    }
}

/**
 * Killer Logic 1
 * 수급 밀도
 *
 * 유통주식 수를 정확히 가져오면 가장 좋지만,
 * 현재 단계에서는 거래량 대비 외국인+기관 순매수 비율로 대체합니다.
 *
 * 의미:
 * 같은 10만 주 순매수라도 거래량 50만 주 종목이
 * 거래량 500만 주 종목보다 더 강한 매집일 수 있습니다.
 */
function calculateFlowDensity(item) {
    const smartMoneyNetBuy = item.foreignNetBuy + item.institutionNetBuy;
    const baseVolume = Math.max(item.volume || item.avgVolume20 || 1, 1);

    const density = smartMoneyNetBuy / baseVolume;
    const densityPercent = density * 100;

    let score = 0;
    const signals = [];

    if (densityPercent >= 15) {
        score += 25;
        signals.push("수급 밀도 매우 강함");
    } else if (densityPercent >= 8) {
        score += 18;
        signals.push("수급 밀도 강함");
    } else if (densityPercent >= 3) {
        score += 10;
        signals.push("수급 밀도 양호");
    }

    if (densityPercent <= -10) {
        score -= 20;
        signals.push("수급 밀도 악화");
    }

    return {
        flowDensity: Number(densityPercent.toFixed(2)),
        flowDensityScore: score,
        flowDensitySignals: signals,
    };
}

/**
 * Killer Logic 2
 * 연속성 스캔
 *
 * 하루 반짝 매수가 아니라 3일 연속 외국인/기관 순매수인지 확인합니다.
 */
function calculateContinuity(item) {
    const rows = item.investorRows || [];
    const recent3 = rows.slice(0, 3);

    let foreignStreak = 0;
    let institutionStreak = 0;
    let twinStreak = 0;

    for (const row of recent3) {
        if (row.foreignNetBuy > 0) foreignStreak += 1;
        if (row.institutionNetBuy > 0) institutionStreak += 1;
        if (row.foreignNetBuy > 0 && row.institutionNetBuy > 0) twinStreak += 1;
    }

    let score = 0;
    const signals = [];

    if (foreignStreak >= 3) {
        score += 15;
        signals.push("외국인 3일 연속 순매수");
    }

    if (institutionStreak >= 3) {
        score += 15;
        signals.push("기관 3일 연속 순매수");
    }

    if (twinStreak >= 3) {
        score += 25;
        signals.push("외국인+기관 3일 연속 쌍끌이");
    } else if (twinStreak >= 2) {
        score += 12;
        signals.push("쌍끌이 수급 연속성 감지");
    }

    return {
        foreignStreak,
        institutionStreak,
        twinStreak,
        continuityScore: score,
        continuitySignals: signals,
    };
}

/**
 * Killer Logic 3
 * 쌍끌이 변동성 필터
 *
 * 외국인/기관이 사더라도 개인 추격매수와 윗꼬리가 강하면 위험.
 */
function calculateVolatilityRisk(item) {
    const high = item.high || item.todayHigh;
    const close = item.price || item.todayClose;
    const low = item.low || item.todayLow;
    const open = item.open || item.todayOpen;

    const candleRange = Math.max(high - low, 1);
    const upperTail = Math.max(high - close, 0);
    const upperTailRatio = (upperTail / candleRange) * 100;

    const body = Math.abs(close - open);
    const bodyRatio = (body / candleRange) * 100;

    const volumeSpike =
        item.avgVolume20 > 0 ? item.volume / item.avgVolume20 : 1;

    let risk = 0;
    const signals = [];

    if (upperTailRatio >= 45) {
        risk += 25;
        signals.push("윗꼬리 과다");
    } else if (upperTailRatio >= 30) {
        risk += 12;
        signals.push("윗꼬리 경계");
    }

    if (item.personalNetBuy > 0 && item.changeRate >= 7) {
        risk += 20;
        signals.push("개인 추격매수 위험");
    }

    if (volumeSpike >= 3 && upperTailRatio >= 30) {
        risk += 20;
        signals.push("거래량 폭증 후 윗꼬리");
    }

    if (item.foreignNetBuy > 0 && item.institutionNetBuy > 0 && risk >= 30) {
        signals.push("쌍끌이지만 단기 변동성 위험");
    }

    return {
        upperTailRatio: Number(upperTailRatio.toFixed(2)),
        bodyRatio: Number(bodyRatio.toFixed(2)),
        volumeSpike: Number(volumeSpike.toFixed(2)),
        volatilityRiskScore: risk,
        volatilityRiskSignals: signals,
    };
}

/**
 * Killer Logic 4
 * 섹터 동조화 지수
 *
 * 같은 테마 안에서 여러 종목이 동시에 강하면
 * 단일 종목 이슈가 아니라 섹터 자금 유입으로 판단합니다.
 */
function calculateSectorSync(allItems) {
    const sectorMap = {};

    for (const item of allItems) {
        if (!sectorMap[item.theme]) {
            sectorMap[item.theme] = [];
        }
        sectorMap[item.theme].push(item);
    }

    const sectorScores = {};

    for (const [theme, stocks] of Object.entries(sectorMap)) {
        const strongStocks = stocks.filter((s) => {
            const twinBuy = s.foreignNetBuy > 0 && s.institutionNetBuy > 0;
            const priceStrong = s.price > s.ma5 && s.ma5 > s.ma20;
            const volumeStrong =
                s.avgVolume20 > 0 ? s.volume / s.avgVolume20 >= 1.5 : false;

            return twinBuy || priceStrong || volumeStrong;
        });

        const syncRatio = strongStocks.length / Math.max(stocks.length, 1);

        let sectorScore = 0;

        if (stocks.length >= 3 && syncRatio >= 0.67) {
            sectorScore = 20;
        } else if (stocks.length >= 2 && syncRatio >= 0.5) {
            sectorScore = 12;
        }

        sectorScores[theme] = {
            theme,
            totalStocks: stocks.length,
            strongStocks: strongStocks.length,
            syncRatio: Number((syncRatio * 100).toFixed(2)),
            sectorScore,
        };
    }

    return sectorScores;
}

function calculateBaseGemScore(item) {
    let score = 0;
    let risk = 0;
    const signals = [];

    if (item.tradingValue >= 50000000000) {
        score += 20;
        signals.push("거래대금 강함");
    } else if (item.tradingValue >= 10000000000) {
        score += 12;
        signals.push("거래대금 증가");
    }

    if (item.volume >= 1000000) {
        score += 12;
        signals.push("거래량 활발");
    }

    if (item.price > item.ma5 && item.ma5 > item.ma20) {
        score += 20;
        signals.push("5일선·20일선 정배열");
    } else if (item.price > item.ma20) {
        score += 10;
        signals.push("20일선 상단");
    }

    if (item.changeRate > 0 && item.changeRate <= 7) {
        score += 10;
        signals.push("상승 흐름 양호");
    }

    if (item.changeRate > 12) {
        risk += 15;
        signals.push("단기 과열 주의");
    }

    if (item.foreignNetBuy > 0) {
        score += 12;
        signals.push("외국인 순매수");
    }

    if (item.institutionNetBuy > 0) {
        score += 12;
        signals.push("기관 순매수");
    }

    if (item.foreignNetBuy > 0 && item.institutionNetBuy > 0) {
        score += 18;
        signals.push("외국인+기관 동시 순매수");
    }

    if (item.foreignNetBuy < 0 && item.institutionNetBuy < 0) {
        score -= 20;
        risk += 25;
        signals.push("외국인+기관 동시 순매도");
    }

    return {
        baseScore: score,
        baseRisk: risk,
        baseSignals: signals,
    };
}

async function analyzeStock(stock) {
    const [price, daily, investor] = await Promise.all([
        fetchPrice(stock),
        fetchDaily(stock),
        fetchInvestor(stock),
    ]);

    const item = {
        ...price,
        ...daily,
        ...investor,
    };

    const base = calculateBaseGemScore(item);
    const density = calculateFlowDensity(item);
    const continuity = calculateContinuity(item);
    const volatility = calculateVolatilityRisk(item);

    return {
        ...item,
        ...base,
        ...density,
        ...continuity,
        ...volatility,
    };
}

function finalizeScores(items) {
    const sectorScores = calculateSectorSync(items);

    return items.map((item) => {
        const sector = sectorScores[item.theme] || {
            sectorScore: 0,
            syncRatio: 0,
            strongStocks: 0,
            totalStocks: 0,
        };

        const totalScore =
            item.baseScore +
            item.flowDensityScore +
            item.continuityScore +
            sector.sectorScore;

        const totalRisk =
            item.baseRisk +
            item.volatilityRiskScore;

        const gemScore = Math.max(
            0,
            Math.round(totalScore - totalRisk * 0.45)
        );

        const signals = [
            ...item.baseSignals,
            ...item.flowDensitySignals,
            ...item.continuitySignals,
            ...item.volatilityRiskSignals,
        ];

        if (sector.sectorScore > 0) {
            signals.push(`${item.theme} 섹터 동조화`);
        }

        let warning = "";

        if (totalRisk >= 50) {
            warning = "추격매수 위험 높음";
        } else if (totalRisk >= 30) {
            warning = "변동성 주의";
        }

        let judgment = "관망";

        if (gemScore >= 80 && totalRisk < 40) {
            judgment = "강한 관심 / 분할매수 후보";
        } else if (gemScore >= 65 && totalRisk < 50) {
            judgment = "관심 / 눌림목 대기";
        } else if (gemScore >= 50) {
            judgment = "관찰 필요";
        }

        const excludeFromTop5 = totalRisk >= 65 || item.upperTailRatio >= 55;

        return {
            code: item.code,
            name: item.name,
            theme: item.theme,

            price: item.price,
            changeRate: item.changeRate,
            volume: item.volume,
            tradingValue: item.tradingValue,
            ma5: item.ma5,
            ma20: item.ma20,

            foreignNetBuy: item.foreignNetBuy,
            institutionNetBuy: item.institutionNetBuy,
            personalNetBuy: item.personalNetBuy,
            investorDate: item.investorDate,

            flowDensity: item.flowDensity,
            foreignStreak: item.foreignStreak,
            institutionStreak: item.institutionStreak,
            twinStreak: item.twinStreak,

            upperTailRatio: item.upperTailRatio,
            volumeSpike: item.volumeSpike,

            sectorSyncRatio: sector.syncRatio,
            sectorStrongStocks: sector.strongStocks,
            sectorTotalStocks: sector.totalStocks,

            baseScore: item.baseScore,
            flowDensityScore: item.flowDensityScore,
            continuityScore: item.continuityScore,
            sectorScore: sector.sectorScore,

            riskScore: Math.round(totalRisk),
            gemScore,
            warning,
            judgment,
            excludeFromTop5,
            signals,
        };
    });
}

app.get("/", (req, res) => {
    res.json({
        status: "OK",
        message: "부의보석 AI OS backend running",
    });
});

app.get("/api/early-gem-real", async (req, res) => {
    try {
        if (!KIS_APP_KEY || !KIS_APP_SECRET) {
            return res.status(500).json({
                error: "KIS_APP_KEY 또는 KIS_APP_SECRET이 .env에 없습니다.",
            });
        }

        const rawResults = [];

        for (const stock of GEM_UNIVERSE) {
            try {
                const analyzed = await analyzeStock(stock);
                rawResults.push(analyzed);
            } catch (error) {
                rawResults.push({
                    code: stock.code,
                    name: stock.name,
                    theme: stock.theme,
                    price: 0,
                    changeRate: 0,
                    volume: 0,
                    tradingValue: 0,
                    ma5: 0,
                    ma20: 0,
                    foreignNetBuy: 0,
                    institutionNetBuy: 0,
                    personalNetBuy: 0,
                    baseScore: 0,
                    baseRisk: 99,
                    flowDensityScore: 0,
                    continuityScore: 0,
                    volatilityRiskScore: 99,
                    baseSignals: ["데이터 오류"],
                    flowDensitySignals: [],
                    continuitySignals: [],
                    volatilityRiskSignals: [],
                    error: true,
                    errorMessage: error.response?.data || error.message,
                });
            }
        }

        const finalResults = finalizeScores(rawResults);

        const top5 = finalResults
            .filter((item) => !item.excludeFromTop5)
            .sort((a, b) => b.gemScore - a.gemScore)
            .slice(0, 5);

        const riskWatch = finalResults
            .filter((item) => item.excludeFromTop5 || item.riskScore >= 50)
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 5);

        res.json({
            updatedAt: new Date().toISOString(),
            engine: "early-gem-real-v3-killer-flow-logic",
            description:
                "거래량, 거래대금, 이동평균, 외국인/기관 수급, 수급 밀도, 3일 연속성, 윗꼬리 위험, 섹터 동조화 반영 TOP5",
            top5,
            riskWatch,
            all: finalResults.sort((a, b) => b.gemScore - a.gemScore),
        });
    } catch (error) {
        res.status(500).json({
            error: "early-gem-real API 오류",
            detail: error.response?.data || error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`부의보석 AI OS backend running on http://localhost:${PORT}`);
});