import { ACTIVE_PROVIDER } from "../../utils/config";
import { getGeminiResponse } from "./gemini";
import { getModel } from "./LMStudio";

export async function fileSummaryAgent(
  drivePrompt: string,
): Promise<string> {

  console.log("Final Prompt to AI:", drivePrompt);

  if (ACTIVE_PROVIDER === "lmstudio") {
    const model = await getModel();
    if (!model) throw new Error("LM Studio model not available");

    const response = await model.respond(drivePrompt);
    return response.nonReasoningContent || "Sorry, no response generated.";
  }

  if (ACTIVE_PROVIDER === "gemini") {
    return await getGeminiResponse(drivePrompt);
  }

  throw new Error("Invalid AI provider");
}