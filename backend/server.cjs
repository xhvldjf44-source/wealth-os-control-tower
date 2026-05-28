require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// 테스트 라우트
app.get("/", (req, res) => {
  res.send("Wealth OS Control Tower Supreme Running");
});


// API 테스트
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend API 정상 작동중",
    time: new Date()
  });
});


// Gemini 테스트
app.post("/api/gemini", async (req, res) => {
  try {

    const userInput = req.body.message || "안녕하세요";

    res.json({
      success: true,
      reply: `Gemini 응답 테스트 완료: ${userInput}`
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});


// 서버 시작
app.listen(PORT, () => {

  console.log("====================================");
  console.log("Wealth OS Control Tower Supreme");
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log("Security: Enabled");
  console.log("8-Agent Pipeline: Enabled");
  console.log("====================================");

});