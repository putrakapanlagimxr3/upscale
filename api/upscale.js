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
    maxFileSize: 10 * 1024 * 1024,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ message: "Gagal upload file" });
    }

    // ⚠️ FIX UTAMA DI SINI
    const imageFile = Array.isArray(files.image)
      ? files.image[0]
      : files.image;

    if (!imageFile) {
      return res.status(400).json({ message: "Image tidak ditemukan" });
    }

    try {
      const buffer = fs.readFileSync(imageFile.filepath);

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", "inline; filename=upscaled.png");

      return res.status(200).send(buffer);
    } catch (error) {
      console.error("Processing error:", error);
      return res.status(500).json({ message: "Gagal memproses gambar" });
    }
  });
}