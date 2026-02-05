import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Gagal upload file" });
    }

    const image = files.image;
    const scale = fields.scale || "4";

    if (!image) {
      return res.status(400).json({ message: "Image tidak ditemukan" });
    }

    try {
      // Dummy upscale: kirim balik image asli
      const buffer = fs.readFileSync(image.filepath);

      res.setHeader("Content-Type", "image/png");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=upscaled_${scale}x.png`
      );

      return res.status(200).send(buffer);
    } catch (error) {
      console.error("Processing error:", error);
      return res.status(500).json({ message: "Gagal memproses gambar" });
    }
  });
}