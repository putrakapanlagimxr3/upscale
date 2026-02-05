export const runtime = "nodejs";

import formidable from "formidable";
import fs from "fs";
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "10mb",
  },
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
    const [fields, files] = await form.parse(req);

    const imageFile = files.image?.[0];
    const scale = Number(fields.scale?.[0] || 4);

    if (!imageFile) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const output = await replicate.run(
      "nightmareai/real-esrgan",
      {
        input: {
          image: fs.createReadStream(imageFile.filepath),
          scale,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error("UPSCALE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}