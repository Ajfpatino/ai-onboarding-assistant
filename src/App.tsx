import { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { sendMessageToAI } from "./api/chatApi/chatProvider";

import  { getGoogleDocPrompt }  from "./tools/GoogleDocsTool"
import MarkdownRenderer from "./components/markdowRenderer";
import { getGoogleDrivePrompt } from "./tools/GoogleDriveTool";
import { getAccessToken, initGoogle, signInGoogle } from "./api/googleAuth";
interface Message {
  text: string;
  sender: "user" | "agent";
}

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  
const GOOGLE_DRIVE_FOLDER_REGEX =
  /https:\/\/drive\.google\.com\/(?:drive\/folders\/[a-zA-Z0-9_-]+|open\?id=[a-zA-Z0-9_-]+)/;

const GOOGLE_DOC_REGEX =
  /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setInput("");
    setLoading(true);

    try {
      let prompt = userMessage;



      const driveFolderMatch = userMessage.match(GOOGLE_DRIVE_FOLDER_REGEX);
      const googleDocMatch = userMessage.match(GOOGLE_DOC_REGEX);

       const needsGoogleAccess = !!driveFolderMatch || !!googleDocMatch;

      let accessToken: string | null = null;

      if (needsGoogleAccess) {
        accessToken = getAccessToken();

        if (!accessToken) {
          await initGoogle();
          accessToken = await signInGoogle();
        }

        if (!accessToken) {
          throw new Error("Google login is required to read Docs or Drive files.");
        }
      }

      if (driveFolderMatch) {
        const driveLink = driveFolderMatch[0];
        console.log('drivematch')

        prompt = await getGoogleDrivePrompt(
          driveLink,
          accessToken!,
          userMessage
        );
      } else if (googleDocMatch) {
        prompt = await getGoogleDocPrompt(userMessage, accessToken!);
      }

      const aiText = await sendMessageToAI(prompt);

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
            : "Error connecting to AI agent.",
          sender: "agent",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <section className=" border-solid  min-h-screen max-w-5xl mx-auto p-6 md:p-8">
      

        <h1 className="text-4xl text-center font-bold mb-5">Get started</h1>

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
                    ? "bg-blue-500 text-white ml-auto text-right"
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
        <div 
          className="flex gap-3" 
          style={{ 
            marginTop: '2rem', 
            marginBottom: '1rem',
            paddingLeft: '1rem',
            paddingRight: '1rem'
          }}
        >
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
            style={{
              margin: '0',
              marginLeft: '0.5rem',
              padding: '0.5rem 1rem'
            }}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default App;