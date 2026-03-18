import { ACTIVE_PROVIDER } from "../../utils/config";
import { getModel } from "./LMStudio";
import { getGeminiResponse } from "./gemini";

interface ChatMessage {
  text: string;
  sender: "user" | "agent";
}

function instructions(): string {
  return `
  You are an an onboarding asistant.

  Your job is to teach the user clearly and patiently about the company and its services.
  documents may be provided to you to help you answer the user's questions.
  you give the user an onboarding plan atleast 5 Tasks and evaulate their knowledge. to help them understand the company and its services.
  give them tasks to complete and assess their knowledge.
  Let them know that they can ask you questions if they need help with the tasks.
  if you know that the user understand the company and its services, you can congratulate them and end the onboarding process.

  Guidelines:
  - Explain concepts step-by-step.
  - Use simple language first, then deeper explanations if needed.
  - Use examples when possible.
  - If the topic comes from a document context, teach the concept based on that document.
  - If the user asks a question, guide them toward understanding instead of only giving the answer.
  - Documents provided may be long and complex. Break down the information into digestible pieces for the user.

  Structure responses like this when possible:
  1. Short explanation
  2. Example or analogy
  3. Optional deeper explanation

  Now respond to the user.

  `.trim();
}

function buildChatHistory(messages: ChatMessage[]): string {
  return messages
    .map((msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
    .join("\n\n");
}

function buildPrompt(
  userPrompt: string,
  messages: ChatMessage[],
  documentContext?: string
): string {
  const history = buildChatHistory(messages);

  return `
${instructions()}

${documentContext ? `Document Context:\n${documentContext}\n` : ""}

Conversation History:
${history}

Latest User Message:
${userPrompt}

Assistant:
  `.trim();
}


export async function sendMessageToAI(
  userPrompt: string,
  messages: ChatMessage[],
  documentContext?: string
): Promise<string> {

  const finalPrompt = buildPrompt(userPrompt, messages, documentContext);

  console.log("Final Prompt to AI:", finalPrompt);

  if (ACTIVE_PROVIDER === "lmstudio") {
    const model = await getModel();
    if (!model) throw new Error("LM Studio model not available");

    const response = await model.respond(finalPrompt);
    return response.nonReasoningContent || "Sorry, no response generated.";
  }

  if (ACTIVE_PROVIDER === "gemini") {
    return await getGeminiResponse(finalPrompt);
  }

  throw new Error("Invalid AI provider");
}