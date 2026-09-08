// Lapisan pemanggilan AI agent untuk Chat AI.
// Tembak POST /api/agent/chat (OpenClaw di VPS); kalau gagal (env kosong,
// VPS mati, jaringan putus), jatuhkan ke balasan contoh supaya UI tetap jalan.

import { chatPage } from "@/lib/content";

// Riwayat chat user yang login (GET /api/agent/chat). Gagal = kosong:
// halaman chat tetap jalan, pengguna mulai percakapan baru.
export async function fetchChatHistory() {
  try {
    const res = await fetch("/api/agent/chat", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.messages) ? data.messages : [];
  } catch {
    return [];
  }
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
