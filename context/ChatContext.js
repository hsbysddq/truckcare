"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { sendMessageToAgent } from "@/lib/agent";
import { chatPage } from "@/lib/content";

// State Chat AI hidup di sini (dipasang di app/dashboard/layout.js) supaya
// percakapan tidak hilang saat berpindah menu di dalam /dashboard.
// Persistensi lintas refresh/perangkat lewat /api/chat (lihat lib/chat-store.js).
const ChatContext = createContext(null);

function toUiMessage(record) {
  return {
    id: record.id,
    role: record.role,
    text: record.content,
    toolTrace: record.tool_trace ?? undefined,
    dataCard: record.data_card ?? undefined,
    truckContext: record.truck_context ?? null,
  };
}

async function persist(message) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error(`simpan pesan gagal: ${res.status}`);
  return res.json();
}

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [truckContext, setTruckContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const askedTruckRef = useRef(null);

  const loadHistory = useCallback(async (signal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", { cache: "no-store", signal });
      if (!res.ok) throw new Error(`muat riwayat gagal: ${res.status}`);
      const data = await res.json();
      const fetched = Array.isArray(data) ? data.map(toUiMessage) : [];
      // Gabungkan, jangan timpa: pesan yang baru dikirim (id sementara
      // user-*/agent-*) mungkin belum ada di server saat GET ini dijawab.
      setMessages((prev) => {
        const known = new Set(fetched.map((m) => m.id));
        const lokal = prev.filter(
          (m) => !known.has(m.id) && /^(user|agent)-/.test(String(m.id))
        );
        return [...fetched, ...lokal];
      });
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError({ kind: "load", text: chatPage.errors.load });
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // AbortController: StrictMode dev memanggil effect dua kali; GET pertama
    // dibatalkan supaya hasilnya tidak menimpa state setelah GET kedua.
    const controller = new AbortController();
    loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  const sendMessage = useCallback(
    async (text, options = {}) => {
      const truck = options.truckContext ?? truckContext ?? null;
      const tempId = `user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: tempId, role: "user", text, truckContext: truck },
      ]);
      setError(null);
      setIsTyping(true);

      // Simpan pesan pengguna sambil menunggu jawaban agent (lewat
      // /api/agent/chat di server; browser tidak pernah memanggil OpenClaw).
      const [savedUser, agentMessage] = await Promise.all([
        persist({ role: "user", content: text, truckContext: truck }).catch(
          () => null
        ),
        sendMessageToAgent(text),
      ]);
      if (savedUser) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: savedUser.id } : m))
        );
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { ...agentMessage, truckContext: truck }]);

      const savedAgent = await persist({
        role: "agent",
        content: agentMessage.text,
        toolTrace: agentMessage.toolTrace ?? null,
        dataCard: agentMessage.dataCard ?? null,
        truckContext: truck,
      }).catch(() => null);
      if (savedAgent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === agentMessage.id ? { ...m, id: savedAgent.id } : m
          )
        );
      }
      if (!savedUser || !savedAgent) {
        setError({ kind: "save", text: chatPage.errors.save });
      }
    },
    [truckContext]
  );

  // Dibuka dari halaman detail truk: tanyakan truk itu sekali saja.
  const askAboutTruck = useCallback(
    (plate) => {
      if (!plate || askedTruckRef.current === plate) return;
      askedTruckRef.current = plate;
      setTruckContext(plate);
      sendMessage(chatPage.truckContextQuestion.replace("{plate}", plate), {
        truckContext: plate,
      });
    },
    [sendMessage]
  );

  const dismissError = useCallback(() => setError(null), []);

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
        askAboutTruck,
        reloadHistory: () => loadHistory(),
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
