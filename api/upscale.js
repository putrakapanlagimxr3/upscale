export const runtime = "nodejs";

import formidable from "formidable";
import fs from "fs";
import Replicate from "replicate";

export const config = {
  api: { bodyParser: false },
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable();
    const [, files] = await form.parse(req);

    const imageFile = files.image?.[0];
    if (!imageFile) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // 🔥 convert ke base64 (INI KUNCI)
    const buffer = fs.readFileSync(imageFile.filepath);
    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    const output = await replicate.run(
      "cjwbw/real-esrgan",
      {
        input: {
          image: base64Image,
          scale: 4
        }
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    const img = await fetch(imageUrl);
    const resultBuffer = Buffer.from(await img.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.send(resultBuffer);

  } catch (err) {
    console.error("UPSCALE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}