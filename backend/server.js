/**
 * GardenStudio AI Media OS
 * Youngja Supreme Engine v3.5
 *
 * 핵심 개선:
 * 1. 느린 6회 AI 호출 제거
 * 2. OpenAI 1회 호출로 전체 전략 JSON 생성
 * 3. 10인 박사 회의체 구조 탑재
 * 4. 영자 디자인실장 완전 탑재
 * 5. data.json / DESIGN.md 자동 생성
 */

import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { fileURLToPath } from "url";

console.log("🔥 Youngja Supreme Engine v3.5 REAL server.js 실행됨");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9010;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "data.json");
const DESIGN_PATH = path.join(__dirname, "DESIGN.md");

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * JSON 안전 저장
 */
async function safeWriteJson(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8");
  await fs.rename(tempPath, filePath);
}

/**
 * AI 응답이 깨졌을 때도 시스템이 죽지 않도록 기본 결과 생성
 */
function createFallbackResult(input = {}) {
  const topic = input.topic || "프리미엄 꽃다발";
  const region = input.region || "나주 광주";
  const audience = input.audience || "꽃 선물을 고민하는 20~40대 고객";

  return {
    project: "GardenStudio AI Media OS",
    version: "Youngja Supreme Engine v3.5",
    mode: "FALLBACK_DEMO",
    created_at: new Date().toISOString(),

    input: { topic, region, audience },

    core_message: "당신의 마음이 가장 아름답게 전달되는 순간을 설계합니다.",

    kpi: {
      expected_margin: 0.38,
      roi_score: 87,
      claim_probability: 0.12,
      automation_score: 92,
    },

    financials: {
      expected_margin: 0.38,
      roi_score: 87,
      warning: "순이익률 35% 이상 유지 가능",
      paypal_fee_check: "글로벌 PayPal 결제 수수료 반영 필요",
    },

    marketing: {
      seo_titles: [
        `${region} 프리미엄 꽃다발 추천`,
        `${region} 꽃배달 감성 선물 가이드`,
        `기념일 꽃 선물, GardenStudio가 설계합니다`,
      ],
      seo_keywords: [
        `${region} 꽃집`,
        `${region} 꽃배달`,
        `${region} 꽃다발`,
        "프리미엄 꽃다발",
        "감성 꽃선물",
        "기념일 꽃 추천",
        "AI 꽃 선물 추천",
      ],
      keyword_cluster: {
        local: [`${region} 꽃집`, `${region} 꽃배달`, `${region} 꽃다발`],
        intent: ["생일", "기념일", "프로포즈", "개업식", "승진"],
        premium: ["프리미엄 꽃다발", "고급 꽃선물", "감성 꽃선물"],
      },
      blog_body:
        "GardenStudio는 꽃을 단순히 판매하지 않습니다. 고객의 마음이 가장 아름답게 전달되는 순간을 설계합니다.",
      shortform_idea: [
        "15초 릴스: 꽃 선물 실패하지 않는 3가지 방법",
        "쇼츠: 기념일 꽃다발 고르는 법",
        "릴스: 말보다 꽃이 먼저 전하는 순간",
      ],
    },

    landing_strategy: {
      headline: "마음을 가장 아름답게 전달하는 꽃 선물",
      subcopy: "GardenStudio는 꽃 선물 문화를 설계하는 AI 감성 브랜드입니다.",
      cta: "오늘의 꽃 선물 설계하기",
      sections: ["히어로", "추천 상품", "선물 상황별 큐레이션", "후기", "문의"],
    },

    brand_positioning: {
      identity: "꽃 선물 문화를 설계하는 AI 브랜드",
      promise: "당신의 마음이 가장 아름답게 전달되는 순간을 설계합니다.",
      tone: "고급스럽고 따뜻하며 감성적인 브랜드 톤",
    },

    search_domination_strategy: {
      naver: "지역 키워드 + 선물 상황 키워드 조합으로 네이버 블로그 점유",
      google: "브랜드명 + 프리미엄 꽃 선물 콘텐츠 축적",
      local: [`${region} 꽃집`, `${region} 꽃배달`, `${region} 기념일 꽃`],
    },

    logistics: {
      routing_path: `${region} 직배송 우선 → 외곽 예약 배송 → 전국 택배 상품 분리`,
      firebase_deploy_status: "READY",
      vercel_deploy_status: "READY",
    },

    system_status: {
      health: "STABLE",
      error_log: [],
      data_json_status: "WRITE_OK",
      design_md_status: "SYNC_OK",
    },

    risk_management: {
      claim_probability: 0.12,
      content_safety: "PASS",
      legal_note: "과대광고 표현 자동 주의 필요",
      payment_security: "CHECK_REQUIRED",
    },

    stitch_mcp: {
      loop_name: "Youngja Stitch Design Loop",
      command_example:
        "영자 디자인실장, GardenStudio 프리미엄 랜딩페이지 3안을 시각화해줘.",
      pages: [
        "Home",
        "SEO Dashboard",
        "Blog Factory",
        "Shortform Studio",
        "Landing Builder",
        "Brand Strategy",
      ],
    },

    agents: {
      ai_ceo: {
        role: "전체 성장 전략 총괄",
        status: "ACTIVE",
      },
      ai_cfo: {
        role: "순이익률 35% 사수",
        status: "ACTIVE",
      },
      ai_marketing: {
        role: "검색창 무한 도배",
        status: "ACTIVE",
      },
      ai_seo_doctor: {
        role: "네이버 SEO 점유",
        status: "ACTIVE",
      },
      ai_content_director: {
        role: "블로그 콘텐츠 공장",
        status: "ACTIVE",
      },
      ai_shortform_producer: {
        role: "릴스/쇼츠 숏폼 제작",
        status: "ACTIVE",
      },
      ai_logistics: {
        role: "배송 및 배포 관리",
        status: "ACTIVE",
      },
      ai_risk_manager: {
        role: "클레임/보안/법적 리스크 검수",
        status: "ACTIVE",
      },
      ai_doctor: {
        role: "시스템 무결성 유지",
        status: "ACTIVE",
      },
      youngja_design_director: {
        role: "감성 브랜딩, DESIGN.md, Stitch UI 총괄",
        status: "SUPREME_ACTIVE",
      },
    },
  };
}

/**
 * DESIGN.md 자동 생성
 */
async function buildDesignMd(result) {
  const content = `# GardenStudio DESIGN.md

## Engine

Youngja Supreme Engine v3.5

## 브랜드 정의

GardenStudio는 단순한 꽃 쇼핑몰이 아닙니다.

> ${result.core_message || "당신의 마음이 가장 아름답게 전달되는 순간을 설계합니다."}

## 영자 디자인실장 역할

- 감성 브랜딩 총괄
- 프리미엄 UI 방향 설정
- DESIGN.md 자동 기록
- Stitch MCP 디자인 루프 관리
- 콘텐츠 톤 검수
- 브랜드 경험 설계

## 컬러 시스템

- Primary: Rose Pink
- Secondary: Warm Beige
- Accent: Deep Green
- Background: Soft Cream
- Text: Charcoal

## UI 방향

- 고급스러움
- 따뜻함
- 감성적
- 신뢰감
- 검색 최적화
- 콘텐츠 확장형

## 핵심 페이지

${result.stitch_mcp?.pages?.map((p) => `- ${p}`).join("\n") || "- Home"}

## 브랜드 포지셔닝

${JSON.stringify(result.brand_positioning, null, 2)}

## 검색 점유 전략

${JSON.stringify(result.search_domination_strategy, null, 2)}

## SEO 키워드

${JSON.stringify(result.marketing?.seo_keywords || [], null, 2)}

## 시스템 상태

${JSON.stringify(result.system_status, null, 2)}

---

자동 생성 시각: ${new Date().toISOString()}
`;

  await fs.writeFile(DESIGN_PATH, content, "utf-8");
}

/**
 * OpenAI 1회 호출로 전체 전략 생성
 */
async function runSupremeCouncil(input = {}) {
  const fallback = createFallbackResult(input);

  if (!openai) {
    return fallback;
  }

  const topic = input.topic || "프리미엄 꽃다발";
  const region = input.region || "나주 광주";
  const audience = input.audience || "꽃 선물을 고민하는 20~40대 고객";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
너는 GardenStudio AI Media OS의 10인 박사 회의체다.

반드시 JSON만 출력한다.
마크다운 금지.
설명문 금지.
JSON 외 텍스트 금지.

GardenStudio의 정체성:
- 꽃을 파는 회사가 아니다.
- 꽃 선물 문화를 설계하는 AI 브랜드다.
- 핵심 메시지: "당신의 마음이 가장 아름답게 전달되는 순간을 설계합니다."
- 목표: 국내 TOP3 꽃 브랜드, 네이버 SEO 점유, AI 콘텐츠 자동화 미디어 브랜드, 1인 기업 자동화 OS.

10인 박사:
1. AI CEO: 전체 성장 전략
2. AI CFO: 순이익률 35% 사수
3. AI Marketing: 검색/콘텐츠 확산
4. AI SEO Doctor: 네이버 SEO 점유
5. AI Content Director: 블로그 콘텐츠
6. AI Shortform Producer: 릴스/쇼츠 아이디어
7. AI Logistics: 배송/배포 관리
8. AI Risk Manager: 클레임/보안/법적 표현 검수
9. AI Doctor: data.json, DESIGN.md 무결성 유지
10. Youngja Design Director: 감성 브랜딩, 고급 UI, DESIGN.md, Stitch MCP 총괄

필수 JSON 필드:
project, version, created_at, input, core_message,
kpi,
financials,
marketing,
logistics,
system_status,
risk_management,
brand_positioning,
landing_strategy,
search_domination_strategy,
stitch_mcp,
agents

주의:
financials.expected_margin은 0.35 이상이면 좋음.
risk_management.claim_probability는 0~1 숫자.
marketing.seo_keywords는 배열.
marketing.seo_titles는 배열.
marketing.shortform_idea는 배열.
`,
        },
        {
          role: "user",
          content: `
아래 조건으로 GardenStudio AI Media OS 전략 전체를 생성하라.

주제: ${topic}
지역: ${region}
타깃 고객: ${audience}

출력은 반드시 JSON만.
`,
        },
      ],
    });

    const text = completion.choices[0].message.content;
    const aiResult = JSON.parse(text);

    return {
      ...fallback,
      ...aiResult,
      version: "Youngja Supreme Engine v3.5",
      created_at: new Date().toISOString(),
      input: { topic, region, audience },
      agents: {
        ...fallback.agents,
        ...(aiResult.agents || {}),
      },
    };
  } catch (error) {
    console.error("AI JSON 생성 실패:", error.message);

    fallback.system_status.error_log.push(error.message);
    fallback.system_status.health = "FALLBACK_STABLE";

    return fallback;
  }
}

/**
 * 기본 루트
 */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "GardenStudio AI Media OS - Youngja Supreme Engine v3.5 Running",
    port: PORT,
  });
});

/**
 * 현재 data.json 조회
 */
app.get("/api/data", async (req, res) => {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.json({
      message: "아직 생성된 data.json이 없습니다.",
      version: "Youngja Supreme Engine v3.5",
    });
  }
});

/**
 * DESIGN.md 조회
 */
app.get("/api/design", async (req, res) => {
  try {
    const design = await fs.readFile(DESIGN_PATH, "utf-8");
    res.json({
      success: true,
      design,
    });
  } catch {
    res.json({
      success: false,
      design: "아직 DESIGN.md가 생성되지 않았습니다.",
    });
  }
});

/**
 * 프론트 버튼 전용 실행 API
 */
app.post("/api/run-pipeline", async (req, res) => {
  try {
    const result = await runSupremeCouncil(req.body);

    await safeWriteJson(DATA_PATH, result);
    await buildDesignMd(result);

    res.json({
      success: true,
      message: "Youngja Supreme Engine v3.5 실행 완료",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "파이프라인 실행 실패",
      error: error.message,
    });
  }
});

/**
 * 서버 상태 체크
 */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    engine: "Youngja Supreme Engine v3.5",
    status: "STABLE",
    youngja: "SUPREME_ACTIVE",
    port: PORT,
  });
});

/**
 * 없는 API 안내
 */
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "존재하지 않는 API 경로입니다.",
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`✅ GardenStudio AI Media OS Backend running on port ${PORT}`);
  console.log(`🌸 Youngja Design Director SUPREME_ACTIVE`);
});