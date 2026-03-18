import { getModel } from "./LMStudio";
import { getGeminiResponse } from "./gemini";

// switch here
//const ACTIVE_PROVIDER: "lmstudio" | "gemini" = "lmstudio";
const ACTIVE_PROVIDER: "lmstudio" | "gemini" = "gemini";

function instructions(userPrompt: string): string {
  return `
You are an an onboarding asistant.

Your job is to teach the user clearly and patiently about the company and its services.
documents may be provided to you to help you answer the user's questions.
you give the user an onboarding plan to help them understand the company and its services.
give them tasks to complete and assess their knowledge.

Guidelines:
- Explain concepts step-by-step.
- Use simple language first, then deeper explanations if needed.
- Use examples when possible.
- If the topic comes from a document context, teach the concept based on that document.
- If the user asks a question, guide them toward understanding instead of only giving the answer.
- you can use knowledge outside of the document if needed

Structure responses like this when possible:
1. Short explanation
2. Example or analogy
3. Optional deeper explanation

Now respond to the user.

${userPrompt}
`.trim();
}

export async function sendMessageToAI(prompt: string): Promise<string> {
  const initialPrompt = instructions(prompt);

  if (ACTIVE_PROVIDER === "lmstudio") {
    const model = await getModel();
    if (!model) throw new Error("LM Studio model not available");

    const response = await model.respond(initialPrompt);
    return response.nonReasoningContent || "Sorry, no response generated.";
  }

  if (ACTIVE_PROVIDER === "gemini") {
    return await getGeminiResponse(initialPrompt);
  }

  throw new Error("Invalid AI provider");
}