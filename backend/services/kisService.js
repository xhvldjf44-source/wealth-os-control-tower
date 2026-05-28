import fs from "fs";
import path from "path";
import axios from "axios";
import Bottleneck from "bottleneck";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, "../.kis-token.json");

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 500,
});

function getEnv(name) {
  const value = process.env[name];

  if (!value) {
    const error = new Error(`${name} 환경변수가 없습니다.`);
    error.status = 500;
    error.detail = `backend/.env 파일에 ${name} 값이 있는지 확인하세요.`;
    throw error;
  }

  return value;
}

function buildKisUrl(pathname) {
  const baseUrl = getEnv("KIS_BASE_URL");

  console.log("[KIS DEBUG] KIS_BASE_URL =", baseUrl);

  try {
    return new URL(pathname, baseUrl).toString();
  } catch (error) {
    const customError = new Error("KIS API URL 생성 실패");
    customError.status = 500;
    customError.detail = {
      baseUrl,
      pathname,
      originalError: error.message,
    };
    throw customError;
  }
}

function saveToken(tokenData) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;

  try {
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isTokenValid(tokenData) {
  if (!tokenData?.access_token || !tokenData?.expires_at) {
    return false;
  }

  return Date.now() < tokenData.expires_at;
}

async function issueAccessToken() {
  const KIS_APP_KEY = getEnv("KIS_APP_KEY");
  const KIS_APP_SECRET = getEnv("KIS_APP_SECRET");

  const url = buildKisUrl("/oauth2/tokenP");

  console.log("[KIS TOKEN URL]", url);

  const response = await axios.post(
    url,
    {
      grant_type: "client_credentials",
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const expiresIn = response.data.expires_in || 86400;

  const tokenData = {
    access_token: response.data.access_token,
    expires_at: Date.now() + expiresIn * 1000 - 60 * 1000,
  };

  saveToken(tokenData);

  console.log("✅ 새 Access Token 발급 완료");

  return tokenData.access_token;
}

async function getAccessToken() {
  const savedToken = loadToken();

  if (isTokenValid(savedToken)) {
    return savedToken.access_token;
  }

  return await issueAccessToken();
}

async function fetchCurrentPrice(code) {
  const KIS_APP_KEY = getEnv("KIS_APP_KEY");
  const KIS_APP_SECRET = getEnv("KIS_APP_SECRET");

  const token = await getAccessToken();

  const url = buildKisUrl(
    "/uapi/domestic-stock/v1/quotations/inquire-price"
  );

  console.log("[KIS PRICE URL]", url);

  const response = await axios.get(url, {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
      tr_id: "FHKST01010100",
    },
    params: {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: code,
    },
  });

  if (response.data?.rt_cd && response.data.rt_cd !== "0") {
    const error = new Error(response.data.msg1 || "KIS 현재가 조회 실패");
    error.status = 502;
    error.detail = response.data;
    throw error;
  }

  const output = response.data.output;

  return {
    code,
    name: output?.hts_kor_isnm || code,
    price: Number(output?.stck_prpr || 0),
    change: Number(output?.prdy_vrss || 0),
    changeRate: Number(output?.prdy_ctrt || 0),
    volume: Number(output?.acml_vol || 0),
  };
}

export async function getCurrentPrice(code) {
  return limiter.schedule(() => fetchCurrentPrice(code));
}