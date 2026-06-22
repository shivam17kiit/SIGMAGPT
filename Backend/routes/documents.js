import express from "express";
import multer from "multer";
import fs from "fs";
import { createRequire } from "module";
import Document from "../models/Document.js";
import Chunk from "../models/chunk.js";
import { chunkText } from "../utils/chunkText.js";
import { createEmbedding } from "../utils/embedding.js";

// pdf-parse v1 is CJS — use createRequire to load it in an ESM project
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse");
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync("uploads/")) {
            fs.mkdirSync("uploads/", { recursive: true });
        }
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post(
    "/upload",
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }

            let text = "";

if (req.file.mimetype === "application/pdf") {
    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(buffer);
    text = pdfData.text;
}
else if (
    req.file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({
        path: req.file.path
    });
    text = result.value;
}
else if (req.file.mimetype === "text/plain") {
    text = fs.readFileSync(req.file.path, "utf8");
}
else {
    return res.status(400).json({
        error: "Unsupported file type"
    });
}
            if (!text || text.trim().length === 0) {
                return res.status(400).json({ error: "Could not extract text from PDF" });
            }

            console.log("PDF text extracted, length:", text.length);

            const chunks = chunkText(text);
            console.log("Chunks created:", chunks.length);

            const doc = await Document.create({
                fileName: req.file.originalname,
                chunks
            });

            for (const chunk of chunks) {
                const embedding = await createEmbedding(chunk);
                await Chunk.create({
                    documentId: doc._id.toString(),
                    text: chunk,
                    embedding
                });
            }

            fs.unlinkSync(req.file.path);

            console.log("Document saved, ID:", doc._id);
            res.json({ success: true, id: doc._id });

        } catch (err) {
            console.error("Upload error:", err.message);
            res.status(500).json({ error: "Upload failed: " + err.message });
        }
    }
);

export default router;