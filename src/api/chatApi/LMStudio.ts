// src/lib/lmstudio.ts
import { LMStudioClient } from "@lmstudio/sdk";
import { LM_STUDIO_MODEL } from "../../utils/config";

export const client = new LMStudioClient({
  baseUrl: "ws://127.0.0.1:1234",
});

// Get the model - need to await client.llm
let modelInstance: ReturnType<Awaited<typeof client.llm>["model"]> | null = null;

export async function getModel() {
  try {
    if (!modelInstance) {
      const llm = client.llm;
      modelInstance = llm.model(LM_STUDIO_MODEL);
    }
    return modelInstance;
  } catch (error) {
    // Reset model instance on error so it can retry
    modelInstance = null;
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to connect to LM Studio: ${errorMsg}. Make sure LM Studio is running and the server is started on port 1234.`
    );
  }
}