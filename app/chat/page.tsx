"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatPreview = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;

  // 來源：交友配對 / 活動牌咖 / 活動旅伴
  source?: "MATCH" | "ACTIVITY_CARD" | "ACTIVITY_TRIP" | null;
  tagText?: string; // 名字後面顯示用
};

let socket: Socket | null = null;

export default function ChatListPage() {
  const [me, setMe] = useState<string>("");
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [msg, setMsg] = useState("");

  // 先抓登入的使用者
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.id) {
          setMe(d.user.id);
        }
      });
  }, []);

  // 將來源 enum 轉成中文標籤
  function sourceToTag(source?: string | null): string {
    if (source === "ACTIVITY_CARD") return "牌咖";
    if (source === "ACTIVITY_TRIP") return "玩伴旅伴";
    return "交友配對"; // 預設
  }

  // 載入「所有聊過天的對象」
  async function loadChats() {
    try {
      const res = await fetch("/api/chats");
      if (res.status === 401) {
        setMsg("請先登入");
        return;
      }
      const data = await res.json();
      const list = (data.chats || []) as any[];

      const mapped: ChatPreview[] = list.map((c) => {
        const src =
          (c.source as "MATCH" | "ACTIVITY_CARD" | "ACTIVITY_TRIP" | null) ??
          null;
        return {
          id: c.id,
          displayName: c.displayName,
          email: c.email,
          avatarUrl: c.avatarUrl ?? null,
          lastMessage: c.lastMessage ?? "（尚未開始聊天）",
          lastTime:
            typeof c.lastTime === "string"
              ? c.lastTime
              : c.lastTime
              ? new Date(c.lastTime).toISOString()
              : "",
          unreadCount: c.unreadCount ?? 0,
          source: src,
          tagText: sourceToTag(src),
        };
      });

      setChats(mapped);
    } catch {
      setMsg("讀取聊天室清單失敗");
    }
  }

  // 第一次進頁面時載入聊天清單
  useEffect(() => {
    loadChats();
  }, []);

  // 即時更新
  useEffect(() => {
    if (!me) return;
    if (!socket) {
      socket = io("http://localhost:4000");
    }

    socket.emit("register-user", { userId: me });

    socket.on("notify-message", (payload: any) => {
      const { from, content, createdAt } = payload;

      setChats((prev) => {
        const exist = prev.find((c) => c.id === from);

        // ✅ 已在列表 → 更新最後訊息 / 時間 / 未讀數
        if (exist) {
          const updated = prev
            .map((c) =>
              c.id === from
                ? {
                    ...c,
                    lastMessage: content,
                    lastTime: createdAt,
                    unreadCount: (c.unreadCount || 0) + 1,
                  }
                : c
            )
            .sort((a, b) => {
              const ta = a.lastTime ? new Date(a.lastTime).getTime() : 0;
              const tb = b.lastTime ? new Date(b.lastTime).getTime() : 0;
              return tb - ta;
            });

          return updated;
        }

        // ❗ 不在列表（例如：主辦人第一次收到報名者訊息）
        // 直接重載一次聊天清單，讓新對象出現在列表中
        loadChats();
        return prev;
      });
    });

    return () => {
      socket?.off("notify-message");
    };
  }, [me]);

  return (
    <main className="min-h-screen bg-amber-50 p-6 flex flex-col items-center text-neutral-900">
      <h1 className="text-3xl font-bold mb-6 text-neutral-900">💬 聊天室</h1>

      {msg && <p className="text-red-600 mb-4">{msg}</p>}

      <div className="w-full max-w-md space-y-2">
        {chats.map((c) => (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="flex items-center gap-4 bg-white hover:bg-neutral-100 rounded-2xl shadow p-4 transition relative text-neutral-900"
          >
            {/* 頭貼 */}
            {c.avatarUrl ? (
              <img
                src={c.avatarUrl}
                alt={c.displayName}
                className="w-12 h-12 rounded-full object-cover border"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl font-semibold text-neutral-900">
                {c.displayName.charAt(0)}
              </div>
            )}

            <div className="flex-1 overflow-hidden">
              <p className="text-xl font-semibold truncate text-neutral-900">
                {c.displayName}
                {/* 名字後面的來源標籤： (牌咖)(玩伴旅伴)(交友配對) */}
                {c.tagText && (
                  <span className="ml-2 text-sm text-neutral-600">
                    （來自{c.tagText}）
                  </span>
                )}
              </p>
              <p className="truncate text-neutral-800">{c.lastMessage}</p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-sm text-neutral-700">
                {c.lastTime
                  ? new Date(c.lastTime).toLocaleTimeString("zh-TW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
              {(c.unreadCount ?? 0) > 0 && (
                <span
                  className="w-3 h-3 bg-blue-500 rounded-full mt-1"
                  aria-label="有未讀訊息"
                ></span>
              )}
            </div>
          </Link>
        ))}

        {chats.length === 0 && (
          <p className="text-lg text-neutral-700 text-center mt-10">
            目前沒有可聊天的對象
          </p>
        )}
      </div>
    </main>
  );
}
