// src/pages/api/generate.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const urlObj = new URL(request.url);
    const model = urlObj.searchParams.get('model') || 'gemini-1.5-flash';

    // 💡フロントから届いた「生の注文票（JSON文字列）」を1文字も漏らさず100%キャッチ
    const rawBody = await request.text();
    
    if (!rawBody || rawBody.trim() === "") {
      return new Response(
        JSON.stringify({ error: { message: "サーバー側でデータを受信できませんでした（Bodyが空です）。" } }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 安全なサーバー側からAPIキーを取得
    const apiKey = import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: "サーバー側にAPIキーが設定されていません。astro.config.mjs の output: 'server' が効いていない可能性があります。" } }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const googleUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    
    // Googleに無加工でそのまま転送！
    const googleRes = await fetch(googleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody, 
    });

    const data = await googleRes.json();

    return new Response(JSON.stringify(data), {
      status: googleRes.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error instanceof Error ? error.message : "Internal Server Error" } }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};