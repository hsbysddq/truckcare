import ToolTrace from "@/components/dashboard/chat/ToolTrace";
import ChatDataCard from "@/components/dashboard/chat/ChatDataCard";

export default function ChatMessage({ message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white sm:max-w-[70%]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] sm:max-w-[75%]">
        {message.toolTrace && <ToolTrace trace={message.toolTrace} />}
        <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <p className="leading-relaxed">{message.text}</p>
          {message.dataCard && <ChatDataCard card={message.dataCard} />}
        </div>
      </div>
    </div>
  );
}
