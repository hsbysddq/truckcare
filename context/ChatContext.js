"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchChatHistory, sendMessageToAgent } from "@/lib/agent";
import { chatPage } from "@/lib/content";

// State Chat AI hidup di sini (dipasang di app/dashboard/layout.js) supaya
// percakapan tidak hilang saat berpindah menu di dalam /dashboard.
// Persistensi lintas refresh/perangkat: riwayat per user dibaca dari
// chat_logs (GET /api/agent/chat); tiap tanya-jawab dicatat server saat
// POST /api/agent/chat, jadi tidak ada penyimpanan terpisah di client.
const ChatContext = createContext(null);
const LOCAL_ID = /^local-/;

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [truckContext, setTruckContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchChatHistory();
      if (signal?.aborted) return;
      // Gabungkan, jangan timpa: pesan yang baru dikirim (id local-*) mungkin
      // belum tercatat di server saat GET ini dijawab.
      setMessages((prev) => {
        const known = new Set(fetched.map((m) => m.id));
        const lokal = prev.filter(
          (m) => !known.has(m.id) && LOCAL_ID.test(String(m.id))
        );
        return [...fetched, ...lokal];
      });
    } catch {
      if (!signal?.aborted) setError({ kind: "load", text: chatPage.errors.load });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // AbortController: StrictMode dev memanggil effect dua kali; hasil
    // panggilan pertama diabaikan supaya tidak menimpa state.
    const controller = new AbortController();
    loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  const sendMessage = useCallback(
    async (text, options = {}) => {
      const truck = options.truckContext ?? truckContext ?? null;
      setMessages((prev) => [
        ...prev,
        { id: `local-user-${Date.now()}`, role: "user", text, truckContext: truck },
      ]);
      setError(null);
      setIsTyping(true);

      // Lewat /api/agent/chat di server (browser tidak memanggil OpenClaw);
      // server sekaligus mencatat tanya-jawab ke chat_logs milik user.
      // Plat truk aktif ikut dikirim supaya agent tahu konteksnya.
      const agentMessage = await sendMessageToAgent(text, truck);

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { ...agentMessage, id: `local-agent-${Date.now()}`, truckContext: truck },
      ]);
    },
    [truckContext]
  );

  // Dibuka dari panel Overview / halaman detail truk (?truk=PLAT): konteks
  // truk langsung aktif tanpa mengirim pesan otomatis; pengguna bertanya
  // sendiri atau memakai saran cepat.
  const activateTruck = useCallback((plate) => {
    if (!plate) return;
    setTruckContext(plate);
  }, []);
  const clearTruckContext = useCallback(() => setTruckContext(null), []);

  const dismissError = useCallback(() => setError(null), []);

  // Hapus seluruh riwayat milik user (server DELETE /api/chat) lalu
  // kosongkan state lokal. Kembalikan true bila berhasil; bila gagal,
  // tampilkan lewat banner error yang sama seperti kegagalan lain.
  const clearHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMessages([]);
      return true;
    } catch {
      setError({ kind: "clear", text: chatPage.errors.clear });
      return false;
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isTyping,
        truckContext,
        setTruckContext,
        loading,
        error,
        sendMessage,
        activateTruck,
        clearTruckContext,
        reloadHistory: () => loadHistory(),
        clearHistory,
        dismissError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat harus dipakai di dalam ChatProvider");
  }
  return ctx;
}
