"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  displayName: string;
  email: string;
  gender?: string | null;
  ageGroup?: string | null;
  city?: string | null;
  interests?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  galleryUrls?: string[]; // 🆕 加上生活照
};

export default function Discovery() {
  const [users, setUsers] = useState<User[]>([]);
  const [index, setIndex] = useState(0);
  const [msg, setMsg] = useState("");

  // 初始化載入使用者列表
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.users)) {
          setUsers(d.users);
        } else {
          setMsg("讀取使用者失敗");
        }
      })
      .catch(() => setMsg("伺服器錯誤"));
  }, []);

  // 按下「喜歡」
  async function like() {
    const u = users[index];
    if (!u || !u.id) {
      setMsg("沒有可喜歡的對象");
      return;
    }

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedId: String(u.id) }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setMsg(data?.error || "送出失敗");
        return;
      }

      if (data.match?.isMutual) {
        setMsg(`你和 ${u.displayName} 互相喜歡了！已加入配對清單`);
      } else {
        setMsg(`已送出喜歡給 ${u.displayName}`);
      }

      setIndex((i) => i + 1);
    } catch (err) {
      setMsg("網路錯誤");
    }
  }

  // 按下「略過」
  function skip() {
    setIndex((i) => i + 1);
    setMsg("略過一位");
  }

  const user = users[index];

  if (!user)
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-6">
        <p className="text-center text-3xl text-neutral-800">
          目前沒有更多使用者
        </p>
      </main>
    );

  // 🔍 主照片：優先用頭貼，其次用生活照第一張
  const mainPhoto =
    user.avatarUrl ||
    (user.galleryUrls && user.galleryUrls.length > 0
      ? user.galleryUrls[0]
      : null);

  const otherPhotos =
    (user.galleryUrls || []).filter((u) => u !== mainPhoto).slice(0, 4);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4 md:p-8">
      <h1 className="text-4xl font-extrabold mb-6 text-neutral-900">
        配對探索
      </h1>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg w-full max-w-2xl">
        {/* 大照片 */}
        <div className="flex justify-center mb-6">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={user.displayName}
              className="w-56 h-56 md:w-64 md:h-64 rounded-3xl object-cover border-4 border-pink-200"
            />
          ) : (
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-3xl bg-pink-200 flex items-center justify-center text-5xl font-bold text-neutral-900">
              {user.displayName.charAt(0)}
            </div>
          )}
        </div>

        {/* 生活照縮圖列（有的話才顯示） */}
        {otherPhotos.length > 0 && (
          <div className="mb-6">
            <p className="text-xl font-semibold text-neutral-900 mb-2">
              生活照
            </p>
            <div className="flex flex-wrap gap-3">
              {otherPhotos.map((url) => (
                <img
                  key={url}
                  src={url}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-neutral-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* 文字資料：字變大、行距拉開 */}
        <div className="space-y-3 mb-6">
          <p className="text-3xl font-bold text-neutral-900">
            {user.displayName}
          </p>

          <p className="text-2xl text-neutral-800">
            {user.gender && <span>{user.gender}</span>}
            {user.gender && user.ageGroup && <span>・</span>}
            {user.ageGroup && <span>{user.ageGroup}</span>}
          </p>

          {user.city && (
            <p className="text-2xl text-neutral-800">🏠 居住地：{user.city}</p>
          )}

          {user.interests && (
            <p className="text-2xl text-neutral-800 leading-relaxed">
              🎯 興趣：{user.interests}
            </p>
          )}

          {user.bio && (
            <p className="text-2xl text-neutral-800 whitespace-pre-line leading-relaxed">
              💬 自我介紹：
              <br />
              {user.bio}
            </p>
          )}

          {/* email 當補充，小一點就好 */}
          <p className="text-lg text-neutral-500 break-all mt-2">
            信箱：{user.email}
          </p>
        </div>

        {/* 按鈕區：大顆、好點 */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={like}
            className="flex-1 px-6 py-4 text-3xl bg-pink-400 hover:bg-pink-500 text-white rounded-3xl shadow-md"
          >
            ❤️ 喜歡
          </button>

          <button
            onClick={skip}
            className="flex-1 px-6 py-4 text-3xl bg-gray-300 hover:bg-gray-400 rounded-3xl shadow-md"
          >
            🚫 略過
          </button>
        </div>

        {msg && (
          <p className="mt-5 text-2xl text-green-700 text-center">{msg}</p>
        )}
      </div>
    </main>
  );
}
