"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("處理中...");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode,
        email,
        password,
        displayName,
      }),
    });

    const data = await res.json();
    setMessage(data.message || data.error || "");

    if (!res.ok) return;

    // ✅ 如果是新註冊，就導到引導頁
    if (data.justRegistered) {
      router.push("/onboarding");
      return;
    }

    // ✅ 如果是登入，就回首頁（你原本的作法）
    if (mode === "login") {
      setTimeout(() => router.push("/"), 500);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-amber-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold mb-6">
          {mode === "login" ? "登入" : "註冊"}
        </h1>
        <div className="space-y-4">
          {mode === "register" && (
            <input
              type="text"
              placeholder="暱稱"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border rounded-lg text-lg"
              required
            />
          )}
          <input
            type="email"
            placeholder="電子郵件"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            required
          />
          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg text-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-blue-400 hover:bg-blue-500 text-white text-xl font-semibold py-3 rounded-lg"
        >
          {mode === "login" ? "登入" : "註冊"}
        </button>
        <p className="mt-4 text-lg text-neutral-700">{message}</p>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-6 text-blue-600 underline text-lg"
        >
          {mode === "login" ? "沒有帳號？註冊一個" : "已有帳號？登入"}
        </button>
      </form>
    </main>
  );
}
