import { useEffect, useRef, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { sendMessage, getHistory } from "./api/chat";
import { MessageBubble } from "./components/messageBubble";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Chat />
    </QueryClientProvider>
  );
}

function Chat() {
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("sessionId") || ""
  );
  const [input, setInput] = useState("");
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const { data, refetch } = useQuery({
    queryKey: ["history", sessionId],
    queryFn: () => getHistory(sessionId),
    enabled: !!sessionId,
  });

  const mutation = useMutation({
    mutationFn: ({ message }: { message: string }) =>
      sendMessage(message, sessionId),
    onSuccess: (res) => {
      setSessionId(res.sessionId);
      localStorage.setItem("sessionId", res.sessionId);

      setInput("");
      setLocalMessages([]); // remove optimistic items
      refetch();
    },
  });

  const clearChat = () => {
    localStorage.removeItem("sessionId");
    setSessionId("");
    window.location.reload();
  };

  const [localMessages, setLocalMessages] = useState<any[]>([]);

  const messages = [...(data?.messages || []), ...localMessages];

  const handleSend = () => {
    if (!input.trim()) return;

    // Show user message instantly
    const optimistic = {
      id: Date.now(), // temporary ID
      sender: "user",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimistic]);

    mutation.mutate({ message: input });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, mutation.isPending]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="p-4 bg-indigo-600 dark:bg-indigo-700 text-white flex justify-between items-center">
        <span className="font-semibold text-lg">Support Assistant</span>

        <div className="flex gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="p-2 bg-black/20 rounded-full text-sm cursor-pointer hover:bg-black/30"
          >
            {dark ? "🌞" : "🌙"}
          </button>

          <button
            onClick={clearChat}
            className="px-3 py-1 bg-black rounded-md hover:bg-black/70 cursor-pointer text-sm"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m: any) => (
          <MessageBubble
            key={m.id}
            sender={m.sender}
            text={m.text}
            timestamp={m.timestamp}
          />
        ))}

        {mutation.isPending && (
          <MessageBubble sender="ai" text="Typing..." typing />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-600 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={mutation.isPending}
          className="flex-1 p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-black dark:text-white outline-none"
          placeholder="Ask something..."
        />
        <button
          onClick={handleSend}
          disabled={mutation.isPending}
          className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 rounded-md disabled:bg-gray-400 dark:hover:bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}
