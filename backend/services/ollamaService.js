export async function analyzeWithOllama(symbol) {
    const response = await fetch(
        "http://localhost:7777/api/ollama/stock",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symbol })
        }
    );

    if (!response.ok) {
        throw new Error("Ollama API failed");
    }

    return response.json();
}

export async function debateWithAI(symbol) {
    const response = await fetch(
        "http://localhost:7777/api/ai/debate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ symbol })
        }
    );

    if (!response.ok) {
        throw new Error("AI Debate failed");
    }

    return response.json();
}