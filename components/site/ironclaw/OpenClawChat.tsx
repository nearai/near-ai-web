"use client";

import { useEffect, useState } from "react";

type ChatMessage = { role: string; text: string; danger: boolean };

type Props = {
  messages: ChatMessage[];
};

const TYPING_MS = 1100;
const HOLD_MS = 2200;
const RESET_MS = 1800;

export default function OpenClawChat({ messages }: Props) {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (typing) {
      timer = setTimeout(() => setTyping(false), TYPING_MS);
    } else if (visible < messages.length - 1) {
      timer = setTimeout(() => {
        setVisible((v) => v + 1);
        setTyping(true);
      }, HOLD_MS);
    } else {
      timer = setTimeout(() => {
        setVisible(0);
        setTyping(true);
      }, RESET_MS);
    }

    return () => clearTimeout(timer);
  }, [typing, visible, messages.length]);

  return (
    <div className="flex flex-col gap-3 font-mono font-light text-xs min-h-[130px]">
      {messages.slice(0, visible + 1).map((msg, i) =>
        msg.danger ? (
          <div key={i} className="pl-3 py-2 rounded-lg bg-[#DC3C3C]/10 border-l-2 border-[#DC3C3C]/30">
            <span className="text-black/40">{msg.role}</span>
            <span className="ml-2 text-[#B23434]">{msg.text}</span>
          </div>
        ) : msg.role === "user" ? (
          <div key={i}>
            <span className="text-black/[0.62]">{msg.role}</span>
            <span className="ml-2 text-[#111]">{msg.text}</span>
          </div>
        ) : (
          <div key={i} className="pl-3 py-2 rounded-lg bg-black/[0.04] border-l-2 border-black/10">
            <span className="text-black/[0.62]">{msg.role}</span>
            <span className="ml-2 text-black/75">{msg.text}</span>
          </div>
        )
      )}
      {typing && (
        <div className="flex items-center gap-1 py-1">
          <span className="ironclaw-typing-dot w-1.5 h-1.5 rounded-full bg-black/30" style={{ animationDelay: "0ms" }} />
          <span className="ironclaw-typing-dot w-1.5 h-1.5 rounded-full bg-black/30" style={{ animationDelay: "150ms" }} />
          <span className="ironclaw-typing-dot w-1.5 h-1.5 rounded-full bg-black/30" style={{ animationDelay: "300ms" }} />
        </div>
      )}
    </div>
  );
}
