"use client";

import { useEffect, useState } from "react";

type Profile = {
  displayName: string;
  gender: string;
  ageGroup: string;
  city: string;
  interests: string;
  bio: string;
  avatarUrl?: string | null;
  galleryUrls?: string[]; // 新增：生活照
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
    gender: "",
    ageGroup: "",
    city: "",
    interests: "",
    bio: "",
    avatarUrl: "",
    galleryUrls: [],
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // 先抓目前資料
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) {
          setMsg("請先登入");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.user) {
          setProfile({
            displayName: d.user.displayName || "",
            gender: d.user.gender || "",
            ageGroup: d.user.ageGroup || "",
            city: d.user.city || "",
            interests: d.user.interests || "",
            bio: d.user.bio || "",
            avatarUrl: d.user.avatarUrl || "",
            galleryUrls: Array.isArray(d.user.galleryUrls)
              ? d.user.galleryUrls
              : [], // 後端還沒給也不會炸
          });
        }
      });
  }, []);

  // 檢查是不是都有填
  function validate(p: Profile) {
    if (!p.displayName.trim()) return "請填寫顯示名稱";
    if (!p.gender.trim()) return "請選擇性別";
    if (!p.ageGroup.trim()) return "請選擇年齡層";
    if (!p.city.trim()) return "請填寫居住地";
    if (!p.interests.trim()) return "請填寫興趣";
    if (!p.bio.trim()) return "請填寫自我介紹";
    // 頭貼這裡也可以要求必填
    if (!p.avatarUrl || !p.avatarUrl.trim())
      return "請填寫頭貼網址（可先貼一張網路圖片測試）";
    return "";
  }

  async function save() {
    setMsg("");
    setError("");

    const v = validate(profile);
    if (v) {
      setError(v);
      return;
    }

    // 把 textarea 填的生活照字串轉成陣列
    const payload = {
      ...profile,
      galleryUrls: profile.galleryUrls?.filter((x) => x.trim() !== "") ?? [],
    };

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMsg("已儲存");
    } else {
      const t = await res.text();
      setError(t || "儲存失敗");
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">👤 我的資料</h1>

      {msg && <p className="mb-4 text-green-700 text-lg">{msg}</p>}
      {error && <p className="mb-4 text-red-600 text-lg">{error}</p>}

      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl space-y-4">
        <label className="block">
          <span className="text-lg">顯示名稱（必填）</span>
          <input
            value={profile.displayName}
            onChange={(e) =>
              setProfile((p) => ({ ...p, displayName: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
          />
        </label>

        <label className="block">
          <span className="text-lg">性別（必選）</span>
          <select
            value={profile.gender}
            onChange={(e) =>
              setProfile((p) => ({ ...p, gender: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
          >
            <option value="">請選擇</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="不透露">不透露</option>
          </select>
        </label>

        <label className="block">
          <span className="text-lg">年齡層（必選）</span>
          <select
            value={profile.ageGroup}
            onChange={(e) =>
              setProfile((p) => ({ ...p, ageGroup: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
          >
            <option value="">請選擇</option>
            <option value="60-65">60-65</option>
            <option value="66-70">66-70</option>
            <option value="71-75">71-75</option>
            <option value="76-80">76-80</option>
            <option value="80以上">80以上</option>
          </select>
        </label>

        <label className="block">
          <span className="text-lg">居住地（必填）</span>
          <input
            value={profile.city}
            onChange={(e) =>
              setProfile((p) => ({ ...p, city: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
            placeholder="例如：台北市"
          />
        </label>

        <label className="block">
          <span className="text-lg">興趣（必填）</span>
          <input
            value={profile.interests}
            onChange={(e) =>
              setProfile((p) => ({ ...p, interests: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
            placeholder="唱歌、散步、打牌…"
          />
        </label>

        <label className="block">
          <span className="text-lg">自我介紹（必填）</span>
          <textarea
            value={profile.bio}
            onChange={(e) =>
              setProfile((p) => ({ ...p, bio: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg min-h-[120px]"
            placeholder="可以寫想認識什麼樣的朋友、平常做什麼…"
          />
        </label>

        {/* 新增：頭貼網址 */}
        <label className="block">
          <span className="text-lg">頭貼網址（必填）</span>
          <input
            value={profile.avatarUrl || ""}
            onChange={(e) =>
              setProfile((p) => ({ ...p, avatarUrl: e.target.value }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg"
            placeholder="貼一張你的照片網址"
          />
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="頭貼預覽"
              className="mt-3 w-24 h-24 rounded-full object-cover border"
            />
          ) : null}
        </label>

        {/* 新增：生活照（多張，換行分隔） */}
        <label className="block">
          <span className="text-lg">生活照（選填，可多張，一行一張）</span>
          <textarea
            value={(profile.galleryUrls || []).join("\n")}
            onChange={(e) =>
              setProfile((p) => ({
                ...p,
                galleryUrls: e.target.value
                  .split("\n")
                  .map((x) => x.trim())
                  .filter(Boolean),
              }))
            }
            className="mt-1 w-full rounded-xl border p-3 text-lg min-h-[100px]"
            placeholder={`https://...\nhttps://...`}
          />
        </label>

        <button
          onClick={save}
          className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-2xl py-3 text-xl"
        >
          儲存
        </button>
      </div>
    </main>
  );
}
