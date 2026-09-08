// Lapisan pemanggilan AI agent untuk Chat AI.
// Tembak POST /api/agent/chat (OpenClaw di VPS); kalau gagal (env kosong,
// VPS mati, jaringan putus), jatuhkan ke balasan contoh supaya UI tetap jalan.

import { chatPage } from "@/lib/content";

// Riwayat chat user yang login (GET /api/chat, dari chat_logs). Hanya
// sumber asli — tidak ada data contoh sebagai cadangan. Sesi habis/401 =
// kosong; kegagalan jaringan/server dilempar supaya UI bisa menampilkan
// pesan galat dan tombol coba lagi.
export async function fetchChatHistory() {
  const res = await fetch("/api/chat", { cache: "no-store" });
  if (res.status === 401) return [];
  if (!res.ok) throw new Error(`riwayat chat gagal: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.messages) ? data.messages : [];
}

export async function sendMessageToAgent(userText) {
  try {
    const response = await fetch("/api/agent/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data?.text) {
        return {
          id: `agent-${Date.now()}`,
          role: "agent",
          text: data.text,
        };
      }
    }
  } catch {
    // Abaikan, pakai balasan contoh di bawah.
  }

  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    id: `agent-${Date.now()}`,
    role: "agent",
    text: chatPage.fallbackReply,
  };
}
