import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.post("/generate-readme", async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Code is required." });
        }

        const response = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a README generator. Write a professional, well-structured README file from source code."
                },
                {
                    role: "user",
                    content: `Generate a README.md for the following code:\n\n${code}`
                }
            ]
        });

        const readme = response.choices[0]?.message?.content;
        res.json({ readme });
    } catch (err) {
        console.log("Groq error:", err);
        res.status(500).json({ error: "Internal Server Error." });
    }
});

// ✅ Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Catch-all route for SPA
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
