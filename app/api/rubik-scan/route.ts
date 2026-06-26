import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64, face } = await req.json();

  const prompt = `You are analyzing a photo of one face of a Rubik's Cube.
The face has 3x3 = 9 stickers. Identify the color of each sticker from top-left to bottom-right, row by row.
Only use these color codes: W (white), Y (yellow), R (red), O (orange), B (blue), G (green).
The center sticker (position 5) is the reference color for this face.

Return ONLY a JSON object like: {"colors": ["W","R","B","Y","G","O","W","R","B"]}
No explanation, no markdown, just the raw JSON.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            }
          },
          { type: "text", text: prompt }
        ]
      }]
    }),
  });

  const data = await res.json();
  const text = data.content?.map((b: any) => b.text || "").join("") || "";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json({ colors: parsed.colors, face });
  } catch {
    return NextResponse.json({ error: "Could not parse colors", raw: text }, { status: 400 });
  }
}
