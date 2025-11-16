"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 台灣縣市選項
const CITY_OPTIONS = [
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "台東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

// 長輩常見興趣選項
const INTEREST_OPTIONS = [
  "散步 / 走路",
  "聊天喝茶",
  "打牌 / 麻將",
  "桌遊 / 撲克牌",
  "唱歌 / 卡拉OK",
  "跳舞",
  "看書 / 寫字",
  "看電視 / 追劇",
  "看電影",
  "下棋（象棋 / 西洋棋）",
  "園藝 / 種花",
  "做菜 / 烘焙",
  "手作 / 編織 / 縫紉",
  "旅遊 / 郊遊",
  "爬山 / 輕健行",
  "宗教活動",
  "志工 / 服務",
];

export default function OnboardingPage() {
  const router = useRouter();

  // 0,1,2,3 四步
  const [step, setStep] = useState(0);

  // 表單欄位
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [interests, setInterests] = useState(""); // 送給後端的一整串字
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  // 照片
  const [avatarUrl, setAvatarUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // 把已經有的資料抓回來
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (r.status === 401) {
          router.push("/auth");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.user) {
          setDisplayName(d.user.displayName || "");
          setGender(d.user.gender || "");
          setCity(d.user.city || "");
          setAgeGroup(d.user.ageGroup || "");

          const rawInterests: string = d.user.interests || "";
          setInterests(rawInterests);
          if (rawInterests) {
            const arr = rawInterests
              .split(/[,，、\s]+/)
              .map((s: string) => s.trim())
              .filter(Boolean);
            setSelectedInterests(arr);
          }

          setBio(d.user.bio || "");
          setAvatarUrl(d.user.avatarUrl || "");
          setGalleryUrls(d.user.galleryUrls || []);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // 每一步的必填條件
  function canNext() {
    if (step === 0) {
      return displayName.trim() !== "" && gender.trim() !== "";
    }
    if (step === 1) {
      return city.trim() !== "" && ageGroup.trim() !== "";
    }
    if (step === 2) {
      return interests.trim() !== "" && bio.trim() !== "";
    }
    if (step === 3) {
      return avatarUrl.trim() !== ""; // 頭貼必填
    }
    return false;
  }

  // 切換興趣勾選
  function toggleInterest(item: string) {
    setSelectedInterests((prev) => {
      let next: string[];
      if (prev.includes(item)) {
        next = prev.filter((i) => i !== item);
      } else {
        next = [...prev, item];
      }
      // 存成一串字，送到後端
      setInterests(next.join("、"));
      return next;
    });
  }

  async function handleFinish() {
    setMsg("儲存中...");
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        gender,
        city,
        ageGroup,
        interests,
        bio,
        avatarUrl,
        galleryUrls,
      }),
    });

    if (res.ok) {
      setMsg("已完成，為您帶位到配對頁...");
      setTimeout(() => router.push("/discovery"), 700);
    } else {
      const t = await res.text();
      setMsg(t || "儲存失敗，請再試一次");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="text-xl">載入中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-amber-50 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2 text-neutral-900">
        填一點資料，我們才好幫您配對 💛
      </h1>
      <p className="text-neutral-700 mb-6 text-lg">步驟 {step + 1} / 4</p>

      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl space-y-5">
        {/* 步驟 0：名字 + 性別 */}
        {step === 0 && (
          <>
            <label className="block">
              <span className="text-lg">要怎麼稱呼您？（必填）</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 text-lg"
                placeholder="例如：林阿姨、王伯伯"
              />
            </label>

            <label className="block">
              <span className="text-lg">性別（必填）</span>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setGender("男")}
                  className={`flex-1 rounded-2xl border p-3 text-lg ${
                    gender === "男" ? "bg-blue-200 border-blue-500" : "bg-white"
                  }`}
                >
                  男
                </button>
                <button
                  type="button"
                  onClick={() => setGender("女")}
                  className={`flex-1 rounded-2xl border p-3 text-lg ${
                    gender === "女" ? "bg-pink-200 border-pink-500" : "bg-white"
                  }`}
                >
                  女
                </button>
              </div>
            </label>
          </>
        )}

        {/* 步驟 1：居住地 + 年齡層 */}
        {step === 1 && (
          <>
            <label className="block">
              <span className="text-lg">您住在哪裡？（必填）</span>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CITY_OPTIONS.map((cName) => (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => setCity(cName)}
                    className={`rounded-xl border px-3 py-2 text-lg ${
                      city === cName
                        ? "bg-amber-200 border-amber-500"
                        : "bg-white"
                    }`}
                  >
                    {cName}
                  </button>
                ))}
              </div>
              {city && (
                <p className="mt-2 text-sm text-neutral-600">
                  已選擇：{city}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-lg">年齡層（必填）</span>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
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
          </>
        )}

        {/* 步驟 2：興趣（複選） + 自我介紹 */}
        {step === 2 && (
          <>
            <label className="block">
              <span className="text-lg">興趣（可複選，必填）</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {INTEREST_OPTIONS.map((opt) => {
                  const active = selectedInterests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className={`rounded-2xl border px-3 py-2 text-lg text-left ${
                        active
                          ? "bg-green-200 border-green-500"
                          : "bg-white"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selectedInterests.length > 0 && (
                <p className="mt-2 text-sm text-neutral-600">
                  已選擇：{selectedInterests.join("、")}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-lg">想跟大家說的話（必填）</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 text-lg min-h-[100px]"
                placeholder="例如：想找人一起走路運動，也喜歡聊天。"
              />
            </label>
          </>
        )}

        {/* 步驟 3：照片 */}
        {step === 3 && (
          <>
            <label className="block">
              <span className="text-lg">上傳大頭貼（必填）</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const form = new FormData();
                  form.append("file", f);
                  const r = await fetch("/api/upload", {
                    method: "POST",
                    body: form,
                  });
                  const d = await r.json();
                  setAvatarUrl(d.url);
                }}
                className="mt-2"
              />
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="頭貼預覽"
                  className="w-28 h-28 rounded-full mt-3 object-cover"
                />
              )}
            </label>

            <label className="block">
              <span className="text-lg">生活照（選填，可多張）</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;
                  const urls: string[] = [];
                  for (const f of Array.from(files)) {
                    const form = new FormData();
                    form.append("file", f);
                    const r = await fetch("/api/upload", {
                      method: "POST",
                      body: form,
                    });
                    const d = await r.json();
                    urls.push(d.url);
                  }
                  setGalleryUrls(urls);
                }}
                className="mt-2"
              />
              {galleryUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {galleryUrls.map((u) => (
                    <img
                      key={u}
                      src={u}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}
            </label>
          </>
        )}

        {/* 按鈕區 */}
        <div className="flex justify-between pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-3 rounded-2xl bg-gray-200 text-lg"
            >
              上一步
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => canNext() && setStep((s) => s + 1)}
              disabled={!canNext()}
              className={`px-6 py-3 rounded-2xl text-lg ${
                canNext()
                  ? "bg-blue-400 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!canNext()}
              className={`px-6 py-3 rounded-2xl text-lg ${
                canNext()
                  ? "bg-green-400 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              完成並開始配對
            </button>
          )}
        </div>

        {msg && <p className="text-neutral-700">{msg}</p>}
      </div>
    </main>
  );
}
