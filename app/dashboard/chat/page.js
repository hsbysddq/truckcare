"use client";

import { useEffect, useRef, useState } from "react";
import { fetchChatHistory, sendMessageToAgent } from "@/lib/agent";
import { chatPage } from "@/lib/content";
import ChatHeader from "@/components/dashboard/chat/ChatHeader";
import ChatEmptyState from "@/components/dashboard/chat/ChatEmptyState";
import ChatMessage from "@/components/dashboard/chat/ChatMessage";
import TypingIndicator from "@/components/dashboard/chat/TypingIndicator";
import ChatInput from "@/components/dashboard/chat/ChatInput";
import AgentActivityPanel from "@/components/dashboard/chat/AgentActivityPanel";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const bottomRef = useRef(null);
  const contextSentRef = useRef(false);

  useEffect(() => {
    let batal = false;
    fetchChatHistory().then((riwayat) => {
      if (!batal && riwayat.length > 0) setMessages(riwayat);
      if (!batal) setIsFirstLoad(false);
    });
    return () => {
      batal = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping]);

  // Dibuka dari halaman detail truk (?truk=PLAT): langsung tanyakan truk itu.
  useEffect(() => {
    if (contextSentRef.current) return;
    const plate = new URLSearchParams(window.location.search).get("truk");
    if (!plate) return;
    contextSentRef.current = true;
    handleSend(chatPage.truckContextQuestion.replace("{plate}", plate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend(text) {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: "user", text },
    ]);
    setIsTyping(true);

    const agentMessage = await sendMessageToAgent(text);

    setIsTyping(false);
    setMessages((prev) => [...prev, agentMessage]);
  }

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />

        {isFirstLoad ? (
          <div className="flex-1" />
        ) : messages.length === 0 ? (
          <ChatEmptyState onSelectQuestion={handleSend} />
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>

      <AgentActivityPanel />
    </div>
  );
}
