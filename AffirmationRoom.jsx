import { useEffect, useState } from "react";

export default function AffirmationRoom() {
    const [message, setMessage] = useState("당신은 이미 충분히 잘하고 있습니다.");
    const [aiResult, setAiResult] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // 기존 확언 기능 유지
    useEffect(() => {
        const messages = [
            "당신은 반드시 성공합니다.",
            "당신은 점점 더 성장하고 있습니다.",
            "부는 당신에게 흐르고 있습니다.",
            "당신은 이미 부자의 사고를 가지고 있습니다."
        ];

        const interval = setInterval(() => {
            const random = Math.floor(Math.random() * messages.length);
            setMessage(messages[random]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // 🔥 AI 실행 함수
    const runAI = async () => {
        try {
            setAiLoading(true);

            const res = await fetch("http://localhost:4000/api/full-engine", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    keyword: "꽃의정원",
                    sources: ["AI", "꽃", "감성", "성장"],
                    category: "프리미엄 꽃 콘텐츠",
                    customerType: "감성형 방문자"
                })
            });

            const data = await res.json();
            setAiResult(data.result || data);
        } catch (error) {
            console.error(error);
            alert("AI 연결 실패");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h1>🌸 확언의 방</h1>

            <h2 style={{ marginTop: "30px", color: "#6b46c1" }}>
                {message}
            </h2>

            {/* 🔥 AI 실행 버튼 */}
            <button
                onClick={runAI}
                style={{
                    marginTop: "30px",
                    padding: "12px 20px",
                    fontSize: "16px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#6b46c1",
                    color: "white",
                    cursor: "pointer"
                }}
            >
                {aiLoading ? "AI 실행 중..." : "💎 AI 오케스트레이터 실행"}
            </button>

            {/* 🔥 AI 결과 출력 */}
            {aiResult && (
                <div style={{ marginTop: "40px", textAlign: "left" }}>
                    <h2>💎 AI 오케스트레이터 결과</h2>

                    <h3>📊 투자 리포트</h3>
                    <pre>{aiResult.investmentReport}</pre>

                    <h3>📝 블로그</h3>
                    <pre>{aiResult.blog}</pre>

                    <h3>🔥 SNS</h3>
                    <pre>{aiResult.sns}</pre>

                    <h3>🛍 상품</h3>
                    <pre>{aiResult.product}</pre>

                    <h3>🔍 SEO</h3>
                    <pre>{JSON.stringify(aiResult.seo, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}