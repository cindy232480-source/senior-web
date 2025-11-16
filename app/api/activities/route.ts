// app/api/activities/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/cookies";

// 取得活動（單筆 or 清單）
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // 目前登入者（可為 null）
  const session = await getSession(req).catch(() => null);
  const userId = session?.sub ?? null;

  // 🔹 單筆活動
  if (id) {
    const act = await prisma.activity.findUnique({
      where: { id },
      include: {
        participants: { select: { userId: true } },
        creator: {
          select: { id: true, displayName: true },
        },
      },
    });

    if (!act) return new Response("Not found", { status: 404 });

    const joined =
      !!userId && act.participants.some((p) => p.userId === userId);

    return Response.json({
      activity: {
        id: act.id,
        title: act.title,
        description: act.description,
        date: act.date,
        location: act.location,
        capacity: act.capacity,
        category: act.category,
        joined,
        joinedCount: act.participants.length,

        // 主辦人資訊
        creatorId: act.creatorId,
        creatorName: act.creator.displayName ?? "",
        creatorPhone: act.contactPhone ?? "", // 主辦人電話
      },
    });
  }

  // 🔹 活動清單（列表）
  const list = await prisma.activity.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: { select: { participants: true } },
      ...(userId
        ? {
            participants: {
              where: { userId },
              select: { id: true },
            },
          }
        : {}),
    },
  });

  const activities = list.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    date: a.date,
    category: a.category, // 👈 列表也帶出類型
    joined: userId
      ? Array.isArray((a as any).participants) &&
        (a as any).participants.length > 0
      : false,
    joinedCount: a._count.participants,
  }));

  return Response.json({ activities });
}

// 建立活動
export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) {
    return new Response(JSON.stringify({ error: "未登入" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));
  const {
    title,
    description,
    date,
    location,
    capacity,
    category,
    contactPhone,
  } = body;

  // ✅ 基本必填檢查
  if (!title?.trim() || !date || !location?.trim() || !category || !contactPhone?.trim()) {
    return new Response(
      JSON.stringify({ error: "請把「活動名稱 / 日期時間 / 地點 / 類型 / 聯絡電話」填寫完整" }),
      { status: 400 }
    );
  }

  // 日期格式檢查
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) {
    return new Response(JSON.stringify({ error: "日期時間格式不正確" }), {
      status: 400,
    });
  }

  // 容量處理（可選）
  let cap: number | null = null;
  if (typeof capacity === "number") {
    cap = capacity;
  } else if (typeof capacity === "string" && capacity.trim() !== "") {
    const num = Number(capacity);
    if (!Number.isNaN(num) && num > 0) {
      cap = num;
    }
  }

  const act = await prisma.activity.create({
    data: {
      title: title.trim(),
      description: description?.toString().trim() || null,
      date: dt,
      location: location.trim(),
      category: category.toString().trim(), // "找牌咖" / "旅遊/玩伴"
      capacity: cap,
      creatorId: session!.sub,
      contactPhone: contactPhone.trim(), // 👈 存主辦人電話
    },
  });

  return Response.json({ activity: act });
}
