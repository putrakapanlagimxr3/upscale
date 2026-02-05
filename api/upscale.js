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
    return res.status(405).end("Method not allowed");
  }

  try {
    const form = formidable({ multiples: false });

    const { files, fields } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const imageFile = files.image;
    if (!imageFile) {
      return res.status(400).end("No image uploaded");
    }

    const scale = Number(fields.scale) || 4;

    const buffer = fs.readFileSync(imageFile.filepath);
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    const output = await replicate.run(
      "cjwbw/real-esrgan",
      {
        input: {
          image: base64Image,
          scale,
        },
      }
    );

    const imageUrl = Array.isArray(output) ? output[0] : output;

    const imgRes = await fetch(imageUrl);
    const resultBuffer = Buffer.from(await imgRes.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(resultBuffer);

  } catch (err) {
    console.error("UPSCALE ERROR:", err);
    res.status(500).end("Gagal memproses gambar");
  }
}