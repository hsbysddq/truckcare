"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { chatPage } from "@/lib/content";
import ChatHeader from "@/components/dashboard/chat/ChatHeader";
import ChatEmptyState from "@/components/dashboard/chat/ChatEmptyState";
import ChatMessage from "@/components/dashboard/chat/ChatMessage";
import TypingIndicator from "@/components/dashboard/chat/TypingIndicator";
import ChatInput from "@/components/dashboard/chat/ChatInput";
import AgentActivityPanel from "@/components/dashboard/chat/AgentActivityPanel";

export default function ChatPage() {
  const {
    messages,
    isTyping,
    loading,
    error,
    sendMessage,
    askAboutTruck,
    reloadHistory,
    dismissError,
  } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isTyping]);

  // ?truk=PLAT dari halaman detail truk — tunggu riwayat termuat dulu supaya
  // pesan baru tidak tertimpa hasil GET.
  useEffect(() => {
    if (loading) return;
    const plate = new URLSearchParams(window.location.search).get("truk");
    if (plate) askAboutTruck(plate);
  }, [loading, askAboutTruck]);

  return (
    <div className="flex h-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />

        {error && (
          <div
            role="alert"
            className="mx-4 mt-4 flex flex-none items-center justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
          >
            <span>{error.text}</span>
            <button
              type="button"
              onClick={error.kind === "load" ? reloadHistory : dismissError}
              className="inline-flex min-h-11 flex-none items-center rounded-full px-3 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              {error.kind === "load"
                ? chatPage.errors.retryLabel
                : chatPage.errors.dismissLabel}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            {chatPage.loadingLabel}
          </div>
        ) : messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}

        <ChatInput onSend={sendMessage} disabled={isTyping || loading} />
      </div>

      <AgentActivityPanel />
    </div>
  );
}
