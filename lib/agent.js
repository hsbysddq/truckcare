// Lapisan pemanggilan AI agent untuk Chat AI.
// Saat ini mengembalikan respons contoh (dummy) dengan jeda buatan
// untuk mensimulasikan pemrosesan. Ganti isi sendMessageToAgent
// dengan pemanggilan API AI asli tanpa perlu mengubah kode UI,
// selama bentuk objek pesan yang dikembalikan tetap sama.

import { chatPage } from "@/lib/content";

export async function sendMessageToAgent(userText) {
  // TODO: ganti simulasi ini dengan pemanggilan API AI asli, misalnya:
  // const response = await fetch("/api/agent/chat", {
  //   method: "POST",
  //   body: JSON.stringify({ message: userText }),
  // });
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    id: `agent-${Date.now()}`,
    role: "agent",
    text: chatPage.fallbackReply,
  };
}
