/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/route.ts
import { prisma } from "@/lib/prisma"; // ✅ 用單例
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/cookies"; // ✅ 設定 HttpOnly Cookie

export async function POST(req: Request) {
  const { action, email, password, displayName } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
  }

  // 🔐 註冊
  if (action === "register") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "信箱已註冊" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || "使用者",
      },
      select: { id: true, email: true, displayName: true },
    });

    // 設定登入狀態
    await setSessionCookie({
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    // ✅ 多回傳 justRegistered: true，前端好導去 /onboarding
    return NextResponse.json({
      message: "註冊成功",
      user,
      justRegistered: true,
    });
  }

  // 🔓 登入
  if (action === "login") {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
      },
    });
    if (!user)
      return NextResponse.json({ error: "帳號不存在" }, { status: 401 });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return NextResponse.json({ error: "密碼錯誤" }, { status: 401 });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
    });

    // 回傳時不要帶密碼
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { passwordHash, ...safeUser } = user as any;

    return NextResponse.json({
      message: "登入成功",
      user: safeUser,
      justRegistered: false,
    });
  }

  return NextResponse.json({ error: "未知的 action" }, { status: 400 });
}
