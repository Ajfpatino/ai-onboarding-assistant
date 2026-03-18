import { GEMINI_MODEL } from "../../utils/config";

export async function getGeminiResponse(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Gemini API key");
    }


    const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
            {
                parts: [{ text: prompt }],
            },
            ],
        }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, no response generated."
    );
}