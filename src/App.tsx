import { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { sendMessageToAI } from "./api/chatApi/chatProvider";
import { Icon } from "@iconify/react";

import  { getGoogleDocPrompt }  from "./tools/GoogleDocsTool"
import MarkdownRenderer from "./components/markdowRenderer";
import { getGoogleDrivePrompt } from "./tools/GoogleDriveTool";
import { getAccessToken, initGoogle, signInGoogle } from "./api/googleAuth";
import { ACTIVE_PROVIDER, GEMINI_MODEL, LM_STUDIO_MODEL, STORAGE_KEY } from "./utils/config";
import SourceModal from "./components/sourceModal";
interface Message {
  text: string;
  sender: "user" | "agent";
}

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [CurrentModel] = useState(ACTIVE_PROVIDER === "lmstudio" ? LM_STUDIO_MODEL : GEMINI_MODEL);
  const [open, setOpen] = useState(false);

  
const GOOGLE_DRIVE_FOLDER_REGEX =
  /https:\/\/drive\.google\.com\/(?:drive\/folders\/[a-zA-Z0-9_-]+|open\?id=[a-zA-Z0-9_-]+)/;

const GOOGLE_DOC_REGEX =
  /https:\/\/docs\.google\.com\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      //get sources from localStorage
      const sources = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as string[];
      let accessToken = getAccessToken();

      if (!accessToken) {
        await initGoogle();
        accessToken = await signInGoogle();
      }

      if (!accessToken) {
        throw new Error("Google login is required to read Docs or Drive files.");
      }

      let sourceContext = "";
      if (sources.length > 0) {

        for (const source of sources) {
          if (GOOGLE_DRIVE_FOLDER_REGEX.test(source)) { 
            const drivePrompt = await getGoogleDrivePrompt(source, accessToken);
            sourceContext += `\n\n[Google Drive Source]\n${drivePrompt}`;

            
          } else if (GOOGLE_DOC_REGEX.test(source)) {
            const docPrompt = await getGoogleDocPrompt(source, userMessage, accessToken);
            sourceContext += `\n\n[Google Doc Source]\n${docPrompt}`;
          }
        };
      }

      const prompt = sourceContext
        ? `Use the following source context to answer the user.\n${sourceContext}\n\nUser message:\n${userMessage}`
        : userMessage;

      const aiText = await sendMessageToAI(prompt, messages);

      setMessages((prev) => [
        ...prev,
        { text: aiText, sender: "agent" },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          text: error instanceof Error
            ? error.message
            : "Error connecting to  AI agent.",
          sender: "agent",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <section className=" border-solid  min-h-screen max-w-5xl mx-auto p-6 md:p-8">


        <h1 className="text-4xl text-center font-bold mb-2">Get started</h1>
        <h2 className="text-gray-500 text-center mb-3">Currently using {CurrentModel}  </h2>
        <div className="flex justify-center">
    
          <Button variant="secondary" onClick={() => setOpen(true)}>Sources
            <Icon icon="material-symbols:settings" />
          </Button>
        </div>
        {/* AI Agent Messages */}
        <div className="mb-6 space-y-3 border-yellow-200">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Start a conversation with your AI agent...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg w-auto max-w-max  border-red-600 ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white ml-auto text-left"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-left"
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                </div>
              </div>
            ))
          )}

          {loading && (
              <div className="p-4 rounded-lg max-w-max bg-gray-500 text-white self-start animate-pulse">
                AI is thinking...
              </div>
            )}
        </div>

        {/* Input + Send */}
        <div className="flex items-center gap-3 h-full">
          <Input
            placeholder="Enter your message"
            value={input}
            disabled={loading}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey && !loading) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={loading}
            className="h-10 px-5"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </section>
    </div>
    <SourceModal open={open} setOpen={setOpen} />
            </>
  );
}

export default App;