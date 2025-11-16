"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => {
        setName(d.user?.displayName ?? null);
      });
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setName(null);
  }

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-2">
          樂齡交友平台
        </h1>
        <p className="text-2xl text-neutral-800 mb-6">
          {name ? `歡迎，${name}！` : "字體大、按鈕大、操作簡單"}
        </p>
        <div className="space-y-4">
          <Link
            href="/discovery"
            className="block w-full rounded-2xl bg-pink-300 hover:bg-pink-400 px-6 py-6 text-2xl font-semibold text-neutral-900 shadow-md"
          >
            ❤️ 一對一配對
          </Link>
          <Link
            href="/activities"
            className="block w-full rounded-2xl bg-green-300 hover:bg-green-400 px-6 py-6 text-2xl font-semibold text-neutral-900 shadow-md"
          >
            👥 活動交友
          </Link>
          {name ? (
            <button
              onClick={logout}
              className="block w-full rounded-2xl bg-gray-300 hover:bg-gray-400 px-6 py-6 text-2xl font-semibold text-neutral-900 shadow-md"
            >
              🚪 登出
            </button>
          ) : (
            <Link
              href="/auth"
              className="block w-full rounded-2xl bg-blue-300 hover:bg-blue-400 px-6 py-6 text-2xl font-semibold text-neutral-900 shadow-md"
            >
              🔐 登入 / 註冊
            </Link>
          )}
        </div>
        <p className="mt-8 text-xl text-neutral-700">
          提示：每個按鈕都可用鍵盤 Tab 選取，亦支援螢幕報讀。
        </p>
      </div>
    </main>
  );
}
