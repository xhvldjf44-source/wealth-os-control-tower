// backend/services/AIAgentService.js

export const askAI = async (message) => {
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gemma:2b",
                prompt: message,
                stream: false,
            }),
        });

        const data = await response.json();

        return data.response;
    } catch (error) {
        console.error("AI 오류:", error);
        return "AI 응답 실패";
    }
};