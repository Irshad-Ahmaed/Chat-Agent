import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);

app.get("/", (_req, res) => {
  res.send("AI Chat Backend is running 🚀");
});

export default app;
