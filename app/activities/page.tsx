// app/activities/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  joined: boolean;
  joinedCount: number;
  category?: string | null;
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [msg, setMsg] = useState("");

  // 開活動流程的狀態
  const [creating, setCreating] = useState(false); // 是否正在開活動
  const [selectedCategory, setSelectedCategory] = useState<
    "card" | "trip" | ""
  >("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [contactPhone, setContactPhone] = useState(""); // 🆕 主辦人電話

  async function load() {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivities(data.activities || []);
    } catch {
      setMsg("讀取活動清單失敗");
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 報名/取消報名
  async function toggleJoin(id: string, joined: boolean) {
    setMsg("處理中...");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: id, join: !joined }),
      });
      const d = await res.json();

      if (res.ok) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  joined: !joined,
                  joinedCount: d.joinedCount ?? a.joinedCount,
                }
              : a
          )
        );
        setMsg(d.message || "");
      } else if (res.status === 401) {
        setMsg("請先登入後再進行報名");
      } else {
        setMsg(d.error || "操作失敗");
      }
    } catch {
      setMsg("伺服器錯誤");
    }
  }

  // 建立活動
  async function submitActivity() {
    setMsg("");

    if (!selectedCategory) {
      setMsg("請先選擇活動類型");
      return;
    }
    if (!title.trim() || !date.trim() || !location.trim()) {
      setMsg("請把「活動名稱 / 日期時間 / 地點」填完整");
      return;
    }
    if (!contactPhone.trim()) {
      setMsg("請填寫聯絡電話，報名者才能找到您");
      return;
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: desc,
        date,
        location,
        capacity: typeof capacity === "string" ? undefined : capacity,
        category: selectedCategory === "card" ? "找牌咖" : "旅遊/玩伴",
        contactPhone,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg("活動已建立！");
      // 清空表單
      setCreating(false);
      setSelectedCategory("");
      setTitle("");
      setDate("");
      setLocation("");
      setDesc("");
      setCapacity("");
      setContactPhone("");
      load();
    } else {
      setMsg(data.error || "建立活動失敗");
    }
  }

  return (
    <main
      id="main"
      className="min-h-screen bg-amber-50 p-6 flex flex-col items-center"
    >
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-neutral-900">
        👥 活動交友
      </h1>
      <p className="text-lg text-neutral-700 mb-5">
        可以自己開活動，也可以參加別人開的
      </p>
      {msg && <p className="text-blue-700 text-xl mb-4">{msg}</p>}

      {/* 1. 一顆很大的「我要開活動」 */}
      {!creating ? (
        <button
          onClick={() => setCreating(true)}
          className="w-full max-w-3xl mb-6 bg-pink-300 hover:bg-pink-400 text-2xl md:text-3xl font-bold rounded-2xl py-5 shadow-md"
        >
          ➕ 我要開活動
        </button>
      ) : (
        <div className="w-full max-w-3xl mb-6 bg-white rounded-2xl shadow p-6 space-y-5">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            選擇活動類型
          </h2>
          {/* 2. 兩個大選項 */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setSelectedCategory("card")}
              className={`flex-1 rounded-2xl p-4 text-left text-xl border-4 ${
                selectedCategory === "card"
                  ? "border-pink-400 bg-pink-50"
                  : "border-transparent bg-amber-50"
              }`}
            >
              <div className="text-3xl mb-2">🀄 找牌咖</div>
              <div className="text-neutral-700">
                麻將、橋牌、桌遊、象棋…一起玩比較好玩
              </div>
            </button>
            <button
              onClick={() => setSelectedCategory("trip")}
              className={`flex-1 rounded-2xl p-4 text-left text-xl border-4 ${
                selectedCategory === "trip"
                  ? "border-green-400 bg-green-50"
                  : "border-transparent bg-amber-50"
              }`}
            >
              <div className="text-3xl mb-2">🧳 找旅伴 / 玩伴</div>
              <div className="text-neutral-700">
                一起散步、郊遊、看展、運動、喝茶聊天
              </div>
            </button>
          </div>

          {/* 3. 選完之後才出現表單 */}
          {selectedCategory !== "" && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-semibold text-neutral-900">
                填寫活動資訊
              </h3>
              <label className="block">
                <span className="text-lg">活動名稱（必填）</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 text-lg"
                  placeholder={
                    selectedCategory === "card"
                      ? "例如：週五晚上打麻將"
                      : "例如：大安森林公園散步"
                  }
                />
              </label>
              <label className="block">
                <span className="text-lg">日期時間（必填）</span>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 text-lg"
                />
              </label>
              <label className="block">
                <span className="text-lg">地點（必填）</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 text-lg"
                  placeholder="例如：台北市信義區市府站、或家裡、社區交誼廳…"
                />
              </label>
              <label className="block">
                <span className="text-lg">主辦人聯絡電話（必填）</span>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 text-lg"
                  placeholder="例：0912-345-678（報名者會看到）"
                />
              </label>
              <label className="block">
                <span className="text-lg">活動說明（可寫需求）</span>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border p-3 text-lg min-h-[100px]"
                  placeholder="例如：想找2位同好一起玩，程度休閒即可"
                />
              </label>
              <label className="block">
                <span className="text-lg">預計人數（可不填）</span>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) =>
                    setCapacity(e.target.value ? Number(e.target.value) : "")
                  }
                  className="mt-1 w-full rounded-xl border p-3 text-lg"
                  placeholder="例如：4"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={submitActivity}
                  className="flex-1 bg-blue-400 hover:bg-blue-500 text-white rounded-2xl py-3 text-xl"
                >
                  建立活動
                </button>
                <button
                  onClick={() => {
                    setCreating(false);
                    setSelectedCategory("");
                  }}
                  className="px-6 py-3 rounded-2xl bg-gray-200 text-lg"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 下面是活動清單 */}
      <div className="w-full max-w-3xl space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-2 flex gap-2 items-center">
              {a.title}
              {a.category && (
                <span className="text-sm bg-amber-200 rounded-full px-3 py-1">
                  {a.category}
                </span>
              )}
            </h2>
            {a.description && (
              <p className="text-neutral-700 mb-2">{a.description}</p>
            )}
            <p className="text-neutral-600 mb-1">
              📅 {new Date(a.date).toLocaleString()}
            </p>
            <p className="text-neutral-700">👤 目前參加：{a.joinedCount}</p>

            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={() => toggleJoin(a.id, a.joined)}
                className={`px-6 py-3 text-xl rounded-2xl shadow-md transition ${
                  a.joined
                    ? "bg-gray-300 hover:bg-gray-400"
                    : "bg-green-300 hover:bg-green-400"
                }`}
              >
                {a.joined ? "取消報名" : "我要參加"}
              </button>

              <Link
                href={`/activities/${a.id}`}
                className="px-6 py-3 text-xl rounded-2xl bg-blue-300 hover:bg-blue-400 focus-visible:outline focus-visible:outline-4"
              >
                查看活動詳情
              </Link>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <p className="text-xl text-neutral-700 text-center">
            目前尚無活動
          </p>
        )}
      </div>
    </main>
  );
}
