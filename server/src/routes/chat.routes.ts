import { Router } from "express";
import { handleMessage } from "../services/chat.service.js";
import prisma from "../db/prisma.js";

const router = Router();

router.post("/message", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message cannot be empty" });
  }

  try {
    const response = await handleMessage(sessionId ?? null, message);
    res.json(response);
  } catch (err) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// Fetch entire conversation history by sessionId
router.get("/history/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: sessionId },
      orderBy: { timestamp: "asc" },
    });

    res.json({ sessionId, messages });
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Unable to fetch conversation history" });
  }
});

export default router;
