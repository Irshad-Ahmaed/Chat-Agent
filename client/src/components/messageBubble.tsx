import { TypingDots } from "./typingDots";

export const MessageBubble = ({ sender, text, timestamp, typing = false }: any) => {
  const isAI = sender === "ai";
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

   return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[50%] px-4 py-2 rounded-xl text-sm
        ${isAI
          ? "bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          : "bg-indigo-600 text-white"
        }`}
      >
        {typing ? <TypingDots /> : text}
        {!typing && <div className="text-[10px] opacity-60 text-right mt-1">{time}</div>}
      </div>
    </div>
  );
}