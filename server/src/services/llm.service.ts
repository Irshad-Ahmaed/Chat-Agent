import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateReply(
  initialPrompt: string,
  history: string,
  userMessage: string
): Promise<string> {
  const systemPrompt = `
You are ShopEasy AI — a friendly and intelligent support agent.

Your responsibilities:
- Understand the user’s intent from minimal context
- Ask clarifying questions if needed, but only when truly necessary
- Remember past messages within the session to respond contextually
- Offer helpful, concise, and conversational support
- Suggest relevant solutions or features
- If user requests something outside support FAQs, provide general help politely

Shop Information:
- We ship worldwide 🌍
- Free shipping orders > $50
- 30-day hassle-free returns 🔁
- Support hours: Monday-Friday, 9AM–6PM
- Contact email: support@shopeasy.com

Tone guidelines:
- Friendly, helpful, and natural
- No robotic or repetitive responses
- Don’t repeat your greeting every time
- Adapt based on prior conversation

if ${initialPrompt} "The user just arrived. Give a warm welcome and help proactively.";

Conversation history for context:
${history}

Now respond to the latest user message:
User: ${userMessage}
`;

  try {
    const result = await model.generateContent(
      systemPrompt + "\nHistory:\n" + history + "\nUser: " + userMessage
    );
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "I'm sorry, something went wrong with support. Try again in a moment.";
  }
}
