const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Anahtarı Kontrolü
console.log("🔑 API Durumu: Yüklü.");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- TEK VE ÇALIŞAN MODEL ---
// Mülakat sorularında hata vermeyen modelin aynısını buraya da koyduk.
const MODEL_NAME = "gemini-2.0-flash"; 

// ---------------------------------------------------------
// 1. ROTA: Mülakat Sorusu Üretme 🧠
// ---------------------------------------------------------
app.post('/mulakat-uret', async (req, res) => {
    try {
        const { jobDescription } = req.body;
        console.log("📩 Soru üretme isteği geldi...");

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `Sen teknik mülakat uzmanısın. Şu iş tanımı için 3 teknik soru üret: ${jobDescription}. 
        Cevabı SADECE saf JSON formatında ver: {"questions": ["soru1", "soru2", "soru3"]}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        console.log("✅ Sorular Hazır");

        let cleanText = text.replace(/```json|```/g, '').trim();
        res.json({ success: true, questions: cleanText });

    } catch (error) {
        console.error("❌ HATA:", error.message);
        res.status(500).json({ success: false, error: "Sunucu hatası." });
    }
});

// ---------------------------------------------------------
// 2. ROTA: Cevap Değerlendirme 📝
// ---------------------------------------------------------
app.post('/cevap-degerlendir', async (req, res) => {
    try {
        const { question, userAnswer, jobDescription } = req.body;
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `Soru: ${question}\nCevap: ${userAnswer}\nBu cevabı 1-10 puanla ve kısa feedback ver. Format: {"score": 8, "feedback": "mesaj"}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let cleanText = response.text().replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanText));
    } catch (error) {
        console.error("❌ Değerlendirme Hatası:", error);
        res.status(500).json({ error: "Değerlendirme yapılamadı" });
    }
});

// ---------------------------------------------------------
// 3. ROTA: Örnek Cevap 🎓
// ---------------------------------------------------------
app.post('/ornek-cevap', async (req, res) => {
    try {
        const { question } = req.body;
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        
        const prompt = `Soru: ${question}\nBu soru için 3 maddelik kısa, net ve emojili cevap yaz. Format: {"answer": "cevap"}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let cleanText = response.text().replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanText));
    } catch (error) {
        console.error("❌ Örnek Cevap Hatası:", error);
        res.status(500).json({ error: "Cevap alınamadı" });
    }
});

// ---------------------------------------------------------
// 4. ROTA: Kariyer Yol Haritası (DÜZELTİLDİ) 🗺️
// ---------------------------------------------------------
app.post('/kariyer-plani', async (req, res) => {
    try {
        const { targetRole } = req.body;
        console.log(`🗺️  ${targetRole} için plan hazırlanıyor...`);

        // Artık hata vermeyen modeli kullanıyoruz
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `Sen uzman bir kariyer koçusun.
        Kullanıcı şu pozisyonda işe girmek istiyor: "${targetRole}".
        Ona 4 haftalık hızlandırılmış çalışma planı ve 3 tane altın tavsiye ver.
        
        Cevabı SADECE şu JSON formatında ver:
        {
            "weeks": [
                {"title": "1. Hafta: Konu Başlığı", "task": "Kısa ve net görevler..."},
                {"title": "2. Hafta: Konu Başlığı", "task": "Kısa ve net görevler..."},
                {"title": "3. Hafta: Konu Başlığı", "task": "Kısa ve net görevler..."},
                {"title": "4. Hafta: Konu Başlığı", "task": "Kısa ve net görevler..."}
            ],
            "tips": ["Tavsiye 1", "Tavsiye 2", "Tavsiye 3"]
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let cleanText = response.text().replace(/```json|```/g, '').trim();
        
        console.log("✅ Plan Oluşturuldu!");
        res.json(JSON.parse(cleanText));

    } catch (error) {
        console.error("❌ Kariyer Planı Hatası:", error.message);
        
        let msg = "Plan oluşturulamadı.";
        if (error.message.includes("429")) msg = "Çok fazla istek yapıldı, lütfen 1 dakika bekleyin.";
        
        res.status(500).json({ error: msg });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});