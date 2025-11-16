// app/api/profile/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/cookies";

// 取得自己的資料
export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return new Response("未登入", { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      displayName: true,
      gender: true,
      ageGroup: true,
      city: true,
      interests: true,
      bio: true,
      avatarUrl: true,
      galleryUrls: true, // ← 新增
    },
  });

  return Response.json({ user: me });
}

// 更新自己的資料（onboarding 用）
export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return new Response("未登入", { status: 401 });

  const body = await req.json();

  // 必填欄位 + 頭貼
  const requiredFields = [
    "displayName",
    "gender",
    "ageGroup",
    "city",
    "interests",
    "bio",
    "avatarUrl", // ← 頭貼必填
  ] as const;

  for (const f of requiredFields) {
    const v = (body[f] ?? "").toString().trim();
    if (!v) {
      return new Response(`缺少必填欄位：${f}`, { status: 400 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: session.sub },
    data: {
      displayName: body.displayName.trim(),
      gender: body.gender.trim(),
      ageGroup: body.ageGroup.trim(),
      city: body.city.trim(),
      interests: body.interests.trim(),
      bio: body.bio.trim(),
      avatarUrl: body.avatarUrl.trim(),
      // 生活照可以不傳
      galleryUrls: Array.isArray(body.galleryUrls)
        ? body.galleryUrls
        : [],
    },
  });

  return Response.json({ user: updated });
}
