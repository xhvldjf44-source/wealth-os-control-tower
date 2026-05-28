require("dotenv").config();

const OpenAI = require("openai");
const express = require("express");

const cors = require("cors");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const PORT = 9010;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const DATA_PATH = path.join(__dirname, "data.json");
const LOCK_PATH = path.join(__dirname, "data.json.lock");

const DEFAULT_DATA = {
  version: "Supreme Version",
  serviceName: "Wealth OS Control Tower",
  updatedAt: null,
  coreMetrics: {
    revenue: 0,
    netProfitRate: 35,
    automationScore: 0
  },
  latestPipeline: null,
  history: []
};

function createId(prefix = "run") {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
}

function nowIso() {
  return new Date().toISOString();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await safeWriteJson(DATA_PATH, DEFAULT_DATA);
  }
}

async function acquireFileLock(maxWaitMs = 5000) {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    try {
      const handle = await fs.open(LOCK_PATH, "wx");
      await handle.writeFile(
        JSON.stringify({
          lockedAt: nowIso(),
          pid: process.pid
        })
      );
      return handle;
    } catch (error) {
      try {
        const stat = await fs.stat(LOCK_PATH);
        const ageMs = Date.now() - stat.mtimeMs;

        if (ageMs > 10000) {
          await fs.unlink(LOCK_PATH);
        }
      } catch {}

      await sleep(80);
    }
  }

  throw new Error("data.json 파일 잠금 획득 실패: 다른 저장 작업이 오래 실행 중입니다.");
}

async function releaseFileLock(handle) {
  try {
    await handle.close();
  } catch {}

  try {
    await fs.unlink(LOCK_PATH);
  } catch {}
}

async function safeReadJson(filePath) {
  await ensureDataFile();
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

async function safeWriteJson(filePath, data) {
  const tempPath = `${filePath}.tmp.${process.pid}.${Date.now()}`;
  const json = JSON.stringify(data, null, 2);

  await fs.writeFile(tempPath, json, "utf-8");
  await fs.rename(tempPath, filePath);
}

async function updateDataSafely(updater) {
  const lockHandle = await acquireFileLock();

  try {
    const current = await safeReadJson(DATA_PATH);
    const next = await updater(current);
    await safeWriteJson(DATA_PATH, next);
    return next;
  } finally {
    await releaseFileLock(lockHandle);
  }
}

async function mcpAdapterStub(context) {
  return {
    adapterName: "MCP Adapter Stub",
    status: "ready",
    purpose: "NotebookLM, 외부 리서치 DB, 파트너 API, 시장 데이터 API를 안전하게 단일 JSON 파이프라인에 주입하기 위한 준비 레이어",
    safetyRules: [
      "외부 데이터는 원본 출처와 호출 시간을 함께 저장한다.",
      "신뢰 점수가 낮은 데이터는 의사결정 필터에서 제외한다.",
      "개인정보, 결제정보, 민감정보는 저장하지 않는다.",
      "외부 API 실패 시 기본 내부 데이터로 파이프라인을 계속 실행한다."
    ],
    injectedKnowledge: {
      marketSignal: "stub_market_signal",
      localDemand: context.region === "나주/광주" ? "high" : "normal",
      externalSeoKeywordHint: ["꽃배달", "나주 꽃집", "광주 꽃배달", "화환", "기념일 꽃다발"]
    }
  };
}

function aiCfoAgent(context) {
  const expectedRevenue = Number(context.expectedRevenue || 120000);
  const expectedCost = Number(context.expectedCost || 72000);
  const netProfit = expectedRevenue - expectedCost;
  const netProfitRate = expectedRevenue > 0 ? Math.round((netProfit / expectedRevenue) * 100) : 0;
  const pass = netProfitRate >= 35;

  return {
    agent: "AI CFO",
    role: "ROI 분석 및 순이익률 35% 하한선 검증",
    status: pass ? "pass" : "blocked",
    expectedRevenue,
    expectedCost,
    netProfit,
    netProfitRate,
    minimumRequiredRate: 35,
    decision: pass ? "판매 가능" : "가격 재설계 필요",
    comment: pass
      ? "순이익률이 35% 이상이므로 운영 가능성이 있습니다."
      : "순이익률이 35% 미만이므로 할인, 배송비, 원가 구조를 재검토해야 합니다."
  };
}

function aiLogisticsAgent(context) {
  const region = context.region || "나주/광주";
  const deliveryDistanceKm = Number(context.deliveryDistanceKm || 18);
  const freshnessRisk = deliveryDistanceKm > 40 ? 35 : deliveryDistanceKm > 20 ? 18 : 8;
  const routeScore = Math.max(0, 100 - deliveryDistanceKm - freshnessRisk);

  return {
    agent: "AI Logistics",
    role: "전국 꽃집 네트워크 매핑 및 나주/광주 직배송 최적 경로 점수 산출",
    status: routeScore >= 70 ? "pass" : "review",
    region,
    networkMap: {
      primaryHub: "나주 직배송 허브",
      secondaryHub: "광주 협력 꽃집",
      fallbackHub: "전국 제휴 꽃집 네트워크"
    },
    deliveryDistanceKm,
    freshnessRisk,
    routeScore,
    recommendation:
      routeScore >= 70
        ? "직배송 우선 배정"
        : "협력 꽃집 배정 또는 배송 시간 재조정 필요"
  };
}

async function aiMarketingAgent(context, mcp) {
  try {
    const prompt = `
당신은 대한민국 최고의 꽃집 SEO 마케팅 전문가다.

상품명:
${context.productName}

지역:
${context.region}

고객 요청:
${context.customerRequest}

아래 형식으로 JSON만 출력해라.

{
  "title": "...",
  "keywords": ["...", "..."],
  "blog": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "당신은 네이버 SEO와 꽃집 마케팅 전문가다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const raw = completion.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        title: `${context.region} ${context.productName} 꽃배달`,
        keywords: ["꽃배달", "기념일꽃다발"],
        blog: raw
      };
    }

    return {
      agent: "AI Marketing",
      role: "OpenAI 기반 네이버 SEO 자동 생성",
      status: "pass",
      naverSeoTitle: parsed.title,
      seoKeywords: parsed.keywords,
      blogDraft: parsed.blog,
      externalApiSpec: {
        openai: true,
        model: "gpt-4o-mini"
      }
    };
  } catch (error) {
    return {
      agent: "AI Marketing",
      role: "OpenAI 기반 네이버 SEO 자동 생성",
      status: "error",
      errorMessage: error.message,
      naverSeoTitle: "SEO 생성 실패",
      seoKeywords: [],
      blogDraft: "OpenAI 호출 실패"
    };
  }
}

function aiRiskManagerAgent(context) {
  const requestText = String(context.customerRequest || "");
  const riskyWords = ["환불 보장", "무조건", "컴플레인", "늦으면 취소", "사진과 똑같이"];
  const matched = riskyWords.filter((word) => requestText.includes(word));

  return {
    agent: "AI Risk Manager",
    role: "위험 주문 및 클레임 소지 사전 필터링",
    status: matched.length > 0 ? "review" : "pass",
    detectedRiskWords: matched,
    riskScore: matched.length * 20,
    recommendation:
      matched.length > 0
        ? "주문 전 고객에게 꽃 수급 상황, 색상 대체 가능성, 배송 시간을 명확히 안내하세요."
        : "큰 위험 신호가 없습니다."
  };
}

function aiDoctorAgent(context, previousResults) {
  const failedAgents = previousResults.filter((item) => item.status === "blocked");
  const reviewAgents = previousResults.filter((item) => item.status === "review");

  return {
    agent: "AI Doctor",
    role: "파이프라인 상태 모니터링 및 셀프 힐링",
    status: failedAgents.length > 0 ? "blocked" : "pass",
    healthScore: Math.max(0, 100 - failedAgents.length * 30 - reviewAgents.length * 10),
    failedAgents: failedAgents.map((item) => item.agent),
    reviewAgents: reviewAgents.map((item) => item.agent),
    selfHealingActions: [
      "try-catch로 개별 에이전트 실패를 격리합니다.",
      "실패한 에이전트가 있어도 전체 서버는 중단하지 않습니다.",
      "로그와 결과 JSON을 함께 저장해 다음 실행에서 추적할 수 있습니다."
    ],
    checkedAt: nowIso()
  };
}

function aiPartnerAgent() {
  return {
    agent: "AI Partner Manager",
    role: "협력 꽃집 및 제휴사 품질 관리",
    status: "pass",
    opinion: "광주 협력 꽃집을 보조 허브로 유지하되, 지연율과 고객 만족도를 월 단위로 평가해야 합니다."
  };
}

function aiResearchAgent(context, mcp) {
  return {
    agent: "AI Researcher",
    role: "시장, 키워드, 수요 데이터 조사",
    status: "pass",
    opinion: "지역 기반 키워드와 당일배송 키워드의 조합이 전환 가능성이 높습니다.",
    mcpSignalUsed: mcp.injectedKnowledge.marketSignal
  };
}

function aiCsAgent() {
  return {
    agent: "AI CS Manager",
    role: "고객 응대 및 리뷰 개선",
    status: "pass",
    opinion: "배송 전 완성 사진 안내와 대체 꽃 안내 문구를 자동 발송하면 클레임을 줄일 수 있습니다."
  };
}

function aiTechLeadAgent() {
  return {
    agent: "AI Tech Lead",
    role: "시스템 안정성 및 API 설계",
    status: "pass",
    opinion: "MCP 어댑터, 에이전트 오케스트레이터, 안전 저장 레이어가 분리되어 확장 가능한 구조입니다."
  };
}

function aiSupplyChainAgent() {
  return {
    agent: "AI Supply Chain Manager",
    role: "꽃 재고, 원가, 공급망 관리",
    status: "pass",
    opinion: "계절 꽃 가격 변동을 반영해 상품별 최소 마진율을 자동 계산해야 합니다."
  };
}

async function runAgentSafely(agentName, fn) {
  try {
    const result = await fn();
    return {
      ok: true,
      ...result
    };
  } catch (error) {
    return {
      ok: false,
      agent: agentName,
      role: "실행 실패",
      status: "error",
      errorMessage: error.message,
      recoveredAt: nowIso()
    };
  }
}

async function runCouncilOf10Pipeline(input) {
  const runId = createId("council10");
  const startedAt = nowIso();

  const context = {
    productName: input.productName || "프리미엄 기념일 꽃다발",
    region: input.region || "나주/광주",
    expectedRevenue: input.expectedRevenue || 120000,
    expectedCost: input.expectedCost || 72000,
    deliveryDistanceKm: input.deliveryDistanceKm || 18,
    customerRequest: input.customerRequest || "기념일 꽃다발을 오늘 예쁘게 배송해주세요."
  };

  const mcp = await mcpAdapterStub(context);

  const firstWave = [];

  firstWave.push(await runAgentSafely("AI CFO", () => aiCfoAgent(context)));
  firstWave.push(await runAgentSafely("AI Logistics", () => aiLogisticsAgent(context)));
  firstWave.push(await runAgentSafely("AI Marketing", () => aiMarketingAgent(context, mcp)));
  firstWave.push(await runAgentSafely("AI Risk Manager", () => aiRiskManagerAgent(context)));
  firstWave.push(await runAgentSafely("AI Partner Manager", () => aiPartnerAgent(context)));
  firstWave.push(await runAgentSafely("AI Researcher", () => aiResearchAgent(context, mcp)));
  firstWave.push(await runAgentSafely("AI CS Manager", () => aiCsAgent(context)));
  firstWave.push(await runAgentSafely("AI Tech Lead", () => aiTechLeadAgent(context)));
  firstWave.push(await runAgentSafely("AI Supply Chain Manager", () => aiSupplyChainAgent(context)));

  const doctor = await runAgentSafely("AI Doctor", () => aiDoctorAgent(context, firstWave));
  const agents = [...firstWave, doctor];

  const cfo = agents.find((item) => item.agent === "AI CFO");
  const logistics = agents.find((item) => item.agent === "AI Logistics");
  const marketing = agents.find((item) => item.agent === "AI Marketing");
  const doctorResult = agents.find((item) => item.agent === "AI Doctor");

  const blocked = agents.filter((item) => item.status === "blocked" || item.status === "error");
  const review = agents.filter((item) => item.status === "review");

  const finalDecision =
    blocked.length > 0
      ? "BLOCKED"
      : review.length > 0
        ? "REVIEW_REQUIRED"
        : "APPROVED";

  return {
    runId,
    pipelineName: "The Council of 10 - AI SEO Business Pipeline",
    status: finalDecision,
    startedAt,
    finishedAt: nowIso(),
    mcpLayer: mcp,
    input: context,
    coreMetrics: {
      revenue: cfo.expectedRevenue,
      netProfitRate: cfo.netProfitRate,
      automationScore: doctorResult.healthScore,
      routeScore: logistics.routeScore
    },
    seoOutput: {
      title: marketing.naverSeoTitle,
      keywords: marketing.seoKeywords,
      blogDraft: marketing.blogDraft,
      externalApiSpec: marketing.externalApiSpec
    },
    agents,
    summary: {
      approvedAgents: agents.filter((item) => item.status === "pass").length,
      reviewAgents: review.length,
      blockedAgents: blocked.length,
      finalDecision,
      nextAction:
        finalDecision === "APPROVED"
          ? "네이버 SEO 콘텐츠 발행 및 주문 자동화 가능"
          : finalDecision === "REVIEW_REQUIRED"
            ? "위험 문구, 배송 조건, 협력 꽃집 배정을 사람이 확인해야 합니다."
            : "순이익률 또는 시스템 오류를 먼저 해결해야 합니다."
    }
  };
}

app.get("/api/health", async (req, res) => {
  res.json({
    ok: true,
    service: "Wealth OS Control Tower Backend",
    port: PORT,
    checkedAt: nowIso()
  });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    await ensureDataFile();
    const data = await safeReadJson(DATA_PATH);
    res.json({
      ok: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "대시보드 데이터 조회 실패",
      error: error.message
    });
  }
});

app.post("/api/ai-seo", async (req, res) => {
  try {
    const pipelineResult = await runCouncilOf10Pipeline(req.body || {});

    const saved = await updateDataSafely(async (current) => {
      const nextHistory = Array.isArray(current.history) ? current.history : [];

      return {
        ...current,
        version: "Supreme Version",
        serviceName: "Wealth OS Control Tower",
        updatedAt: nowIso(),
        coreMetrics: {
          revenue: pipelineResult.coreMetrics.revenue,
          netProfitRate: pipelineResult.coreMetrics.netProfitRate,
          automationScore: pipelineResult.coreMetrics.automationScore
        },
        latestPipeline: pipelineResult,
        history: [pipelineResult, ...nextHistory].slice(0, 30)
      };
    });

    res.json({
      ok: true,
      message: "10인 에이전트 파이프라인 실행 완료",
      data: saved
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "AI SEO 파이프라인 실행 실패",
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "존재하지 않는 API 경로입니다.",
    path: req.path
  });
});

ensureDataFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Wealth OS Control Tower backend running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("서버 시작 실패:", error);
    process.exit(1);
  });