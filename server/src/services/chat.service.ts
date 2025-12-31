import prisma from "../db/prisma.js";
import redis from "../db/redis.js";
import { generateReply } from "./llm.service.js";

const HISTORY_LIMIT = 10;

async function getHistory(conversationId: string) {
  // Try Redis first
  const cached = await redis.lrange(conversationId, 0, -1);
  if (cached.length > 0) return cached.reverse().join("\n");

  // Fallback → DB
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { timestamp: "desc" },
    take: HISTORY_LIMIT,
  });

  const mapped = messages.map((msg) => `${msg.sender}: ${msg.text}`).reverse();
  if (mapped.length > 0) {
    await redis.del(conversationId);
    await redis.rpush(conversationId, ...mapped);
  }

  return mapped.join("\n");
}

async function updateCache(conversationId: string, sender: string, text: string) {
  await redis.rpush(conversationId, `${sender}: ${text}`);
  await redis.ltrim(conversationId, -HISTORY_LIMIT, -1); // keep only last 10 messages
  redis.expire(conversationId, 3600); // 1hr expiry
}

export async function handleMessage(sessionId: string | null, message: string) {
  let conversationId = await prisma.conversation.findFirst({
    where: sessionId ? { id: sessionId } : {},
  }).then(convo => convo?.id);
  
  let initialPrompt = "";

  if (!conversationId) {
    const convo = await prisma.conversation.create({ data: {} });
    conversationId = convo.id;
    initialPrompt = "The user just arrived. Give a warm welcome and help proactively.";
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId,
      sender: "user",
      text: message,
    },
  });
  await updateCache(conversationId, "user", message);

  const history = await getHistory(conversationId);
  const aiReply = await generateReply(initialPrompt, history, message);

  // Save AI message
  await prisma.message.create({
    data: {
      conversationId,
      sender: "ai",
      text: aiReply,
    },
  });
  await updateCache(conversationId, "ai", aiReply);

  return { reply: aiReply, sessionId: conversationId };
}
