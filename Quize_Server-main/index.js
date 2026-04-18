// server/index.js
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: "uploads/" });

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("✅ File received:", req.file.originalname);

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    const prompt = `
    You are an expert quiz maker.
    Analyze the content or text from this image and generate 10 quiz questions.
    Each question should have 4 options (A, B, C, D) and one correct answer.
    Format the output strictly as JSON like this:
    [
      {
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "..."
      }
    ]
    `;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: req.file.mimetype,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    console.log("📤 Sending request to Gemini API...");

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    console.log("📥 Gemini Raw Response:", JSON.stringify(result, null, 2)); // 👈 ADD THIS

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("📜 Extracted Text:", text); // 👈 ADD THIS

    const jsonMatch = text.match(/\[([\s\S]*)\]/);
    const quiz = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    fs.unlinkSync(req.file.path);
    res.json(quiz);
  } catch (err) {
    console.error("❌ Error details:", err);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});




app.listen(5000, () =>
  console.log("✅ Gemini Server running on http://localhost:5000")
);
