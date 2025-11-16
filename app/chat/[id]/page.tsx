// app/chat/[id]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

type Msg = {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

let socket: Socket | null = null;

export default function ChatRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const otherId = params.id as string;

  // 例如：/chat/123?from=card / from=trip
  const from = searchParams.get("from"); // "card" | "trip" | null

  const [me, setMe] = useState<string>("");
  const [otherName, setOtherName] = useState<string>("聊天室");
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [list, setList] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.id) setMe(d.user.id);
      });
  }, []);

  useEffect(() => {
    fetch(`/api/messages?user=${otherId}`)
      .then((r) => r.json())
      .then((d) => {
        setList(d.messages || []);
        setOtherName(d.other?.displayName || "聊天室");
        setOtherAvatar(d.other?.avatarUrl || null);
      });
  }, [otherId]);

  useEffect(() => {
    if (!me) return;

    if (!socket) {
      socket = io("http://localhost:4000");
    }

    socket.emit("join-chat", { me, other: otherId });
    socket.emit("read-chat", { me, other: otherId });

    socket.on("new-message", (msg: any) => {
      if (
        (msg.from === me && msg.to === otherId) ||
        (msg.from === otherId && msg.to === me)
      ) {
        setList((prev) => [
          ...prev,
          {
            senderId: msg.from,
            receiverId: msg.to,
            content: msg.content,
            createdAt: msg.createdAt,
          },
        ]);
      }
    });

    return () => {
      socket?.emit("read-chat", { me, other: otherId });
      socket?.off("new-message");
    };
  }, [me, otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [list]);

  // 把 URL 的 from -> 後端 enum
  function getSourceEnum():
    | "MATCH"
    | "ACTIVITY_CARD"
    | "ACTIVITY_TRIP"
    | undefined {
    if (from === "card") return "ACTIVITY_CARD";
    if (from === "trip") return "ACTIVITY_TRIP";
    // 沒有 from，就讓後端存 null
    return undefined;
  }

  async function send() {
    if (!text.trim() || !me) return;

    const source = getSourceEnum();

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: otherId,
        content: text,
        source, // 🆕 傳給後端
      }),
    });

    setList((prev) => [
      ...prev,
      {
        senderId: me,
        receiverId: otherId,
        content: text,
        createdAt: new Date().toISOString(),
      },
    ]);

    socket?.emit("send-message", {
      from: me,
      to: otherId,
      content: text,
    });

    setText("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  function isNewDay(current: string, previous?: string) {
    if (!previous) return true;
    const c = new Date(current);
    const p = new Date(previous);
    return (
      c.getFullYear() !== p.getFullYear() ||
      c.getMonth() !== p.getMonth() ||
      c.getDate() !== p.getDate()
    );
  }

  return (
    <main className="min-h-screen bg-[#E5DDD5] flex flex-col">
      {/* 標題列：只有名字，靠左 */}
      <header className="bg-[#075E54] text-white text-2xl font-semibold p-4 shadow-md text-left">
        {otherName}
      </header>

      {/* 訊息區 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {list.map((m, idx) => {
          const isMe = m.senderId === me;
          const showDivider = isNewDay(m.createdAt, list[idx - 1]?.createdAt);

          return (
            <div key={m.id ?? idx}>
              {showDivider && (
                <div className="text-center text-sm text-neutral-600 my-2">
                  ── {new Date(m.createdAt).toLocaleDateString("zh-TW")} ──
                </div>
              )}
              <div
                className={`flex ${
                  isMe ? "justify-end" : "justify-start"
                } items-end gap-2`}
              >
                {!isMe && (
                  <>
                    {otherAvatar ? (
                      <img
                        src={otherAvatar}
                        alt={otherName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-sm text-white">
                        {otherName.charAt(0)}
                      </div>
                    )}
                  </>
                )}

                <div
                  className={`p-3 rounded-2xl text-lg max-w-[70%] shadow-md ${
                    isMe
                      ? "bg-[#DCF8C6] text-right text-black"
                      : "bg-white text-left text-black"
                  }`}
                >
                  {m.content}
                  <div className="text-xs text-neutral-600 mt-1 text-right">
                    {new Date(m.createdAt).toLocaleTimeString("zh-TW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="bg-white p-3 flex items-center gap-2 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-full border p-3 text-lg"
          placeholder="輸入訊息..."
        />
        <button
          onClick={send}
          className="bg-[#25D366] hover:bg-[#20c15b] text-white rounded-full px-6 py-2 text-lg"
        >
          發送
        </button>
      </div>
    </main>
  );
}
