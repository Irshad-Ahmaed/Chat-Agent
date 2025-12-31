import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_API_BASE_URL || "http://localhost:5000",
});

export const sendMessage = async (message: string, sessionId?: string) => {
  const res = await API.post("/chat/message", { message, sessionId });
  return res.data;
};

export const getHistory = async (sessionId: string) => {
  const res = await API.get(`/chat/history/${sessionId}`);
  return res.data;
};
