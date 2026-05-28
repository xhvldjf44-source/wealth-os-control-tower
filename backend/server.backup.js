import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const KIS_BASE_URL = process.env.KIS_BASE_URL;
const KIS_APP_KEY = process.env.KIS_APP_KEY;
const KIS_APP_SECRET = process.env.KIS_APP_SECRET;
const KIS_ACCOUNT_NO = process.env.KIS_ACCOUNT_NO;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKEN_FILE_PATH = path.join(__dirname, ".kis-token.json");

app.use(helmet());

app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);

app.use(express.json());

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        message: {
            success: false,
            message: "요청이 너무 많습니다. 잠시 후 다시 시도하세요.",
        },
    })
);

function checkKisEnv() {
    const missing = [];

    if (!KIS_BASE_URL) missing.push("KIS_BASE_URL");
    if (!KIS_APP_KEY) missing.push("KIS_APP_KEY");
    if (!KIS_APP_SECRET) missing.push("KIS_APP_SECRET");


    if (missing.length > 0) {
        throw new Error(`KIS 환경변수 누락: ${missing.join(", ")}`);
    }
}

async function readSavedToken() {
    try {
        const raw = await fs.readFile(TOKEN_FILE_PATH, "utf-8");
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

async function saveToken(tokenData) {
    await fs.writeFile(
        TOKEN_FILE_PATH,
        JSON.stringify(tokenData, null, 2),
        "utf-8"
    );
}

function isTokenValid(tokenData) {
    if (!tokenData?.access_token || !tokenData?.expires_at) return false;

    const now = Date.now();
    const expiresAt = new Date(tokenData.expires_at).getTime();

    // 만료 5분 전부터는 새로 발급
    const safetyBuffer = 5 * 60 * 6000;

    return expiresAt - safetyBuffer > now;
}

async function issueKisAccessToken() {
    checkKisEnv();

    const response = await fetch(`${KIS_BASE_URL}/oauth2/tokenP`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
            grant_type: "client_credentials",
            appkey: KIS_APP_KEY,
            appsecret: KIS_APP_SECRET,
        }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        console.error("KIS 토큰 발급 실패:", data);
        throw new Error("KIS 토큰 발급에 실패했습니다.");
    }

    const expiresInSeconds = Number(data.expires_in || 86400);

    const tokenData = {
        access_token: data.access_token,
        token_type: data.token_type || "Bearer",
        expires_in: expiresInSeconds,
        expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        issued_at: new Date().toISOString(),
    };

    await saveToken(tokenData);

    return tokenData;
}

async function getKisAccessToken({ forceRefresh = false } = {}) {
    const savedToken = await readSavedToken();

    if (!forceRefresh && isTokenValid(savedToken)) {
        return savedToken.access_token;
    }

    const newToken = await issueKisAccessToken();
    return newToken.access_token;
}

async function kisFetch(pathname, options = {}) {
    const token = await getKisAccessToken();

    const url = new URL(`${KIS_BASE_URL}${pathname}`);

    if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            authorization: `Bearer ${token}`,
            appkey: KIS_APP_KEY,
            appsecret: KIS_APP_SECRET,
            custtype: "P",
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await response.json();

    // 토큰 만료 가능성 대응: 1회 재발급 후 재시도
    if (response.status === 401 || data?.msg_cd === "EGW00123") {
        const newToken = await getKisAccessToken({ forceRefresh: true });

        const retryResponse = await fetch(url, {
            method: options.method || "GET",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                authorization: `Bearer ${newToken}`,
                appkey: KIS_APP_KEY,
                appsecret: KIS_APP_SECRET,
                custtype: "P",
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const retryData = await retryResponse.json();

        if (!retryResponse.ok) {
            console.error("KIS 재시도 실패:", retryData);
            throw new Error("KIS API 요청 실패");
        }

        return retryData;
    }

    if (!response.ok) {
        console.error("KIS API 실패:", data);
        throw new Error("KIS API 요청 실패");
    }

    return data;
}

app.get("/health", (req, res) => {
    res.json({
        success: true,
        service: "Wealth OS Backend",
        status: "healthy",
        port: PORT,
        time: new Date().toISOString(),
    });
});

app.get("/api/wealth/command-center", (req, res) => {
    res.json({
        success: true,
        message: "Wealth Command Center API 정상 작동",
        data: {
            backend: "connected",
            frontend: "connected",
            kis: "ready",
            mode: "Wealth OS / 부의보석 AI OS",
        },
    });
});

app.get("/api/kis/token/refresh-test", async (req, res) => {
    try {
        const tokenData = await issueKisAccessToken();

        res.json({
            success: true,
            message: "KIS access token 테스트 발급 완료",
            issuedAt: tokenData.issued_at,
            expiresAt: tokenData.expires_at,
            preview: `${tokenData.access_token.slice(0, 20)}...`,
        });
    } catch (error) {
        console.error("KIS TEST TOKEN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "KIS 테스트 토큰 발급 실패",
            error: error.message,
        });
    }
});

app.get("/api/kis/price/:code", async (req, res) => {
    try {
        const { code } = req.params;

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                success: false,
                message: "종목코드는 6자리 숫자여야 합니다. 예: 005930",
            });
        }
        console.log("PRICE API START:", code);
        const data = await kisFetch(

            "/uapi/domestic-stock/v1/quotations/inquire-price",
            {
                headers: {
                    tr_id: "FHKST01010100",
                },
                query: {
                    FID_COND_MRKT_DIV_CODE: "J",
                    FID_INPUT_ISCD: code,
                },
            }
        );
        console.log("KIS PRICE RESPONSE:", data);
        res.json({
            success: true,
            code,
            source: "KIS Open API",
            data,
        });
    } catch (error) {
        console.error("KIS PRICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "KIS 현재가 조회 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "존재하지 않는 API 경로입니다.",
    });
});

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.message);

    res.status(500).json({
        success: false,
        message: "서버 내부 오류가 발생했습니다.",
    });
});

const server = app.listen(PORT, () => {
    console.log(`Wealth OS Backend running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
    console.error("SERVER ERROR:", err);
});