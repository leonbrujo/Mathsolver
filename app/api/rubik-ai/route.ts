import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { move, stepNum, total, lang } = await req.json();

  const prompt =
    lang === "es"
      ? `Eres un tutor experto en cubo Rubik. Explica de forma clara y amigable (2-3 oraciones) el movimiento "${move}" que es el paso ${stepNum} de ${total} en la solución del cubo. Incluye para qué sirve este movimiento en la estrategia general.`
      : `You are an expert Rubik's cube tutor. Clearly and friendly explain (2-3 sentences) the move "${move}" which is step ${stepNum} of ${total} in the cube solution. Include what this move achieves in the overall strategy.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const text = data.content?.map((b: any) => b.text || "").join("") || "";
  return NextResponse.json({ explanation: text });
}
