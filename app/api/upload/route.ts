// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "沒有檔案" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 把檔案轉成 buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上傳到 Cloudinary（用 upload_stream）
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "senior-web", // 你可以改成自己想要的資料夾名稱
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    const url = (uploadResult as any).secure_url as string;

    // 回傳 Cloudinary 的網址給前端
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("上傳失敗", err);
    return new Response(JSON.stringify({ error: "上傳失敗" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
