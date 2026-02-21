const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ HATA: .env dosyasında API anahtarı yok!");
    process.exit(1);
}

async function listModels() {
    console.log("🔍 Google'a soruluyor: 'Hangi modelleri kullanabilirim?'...");
    
    try {
        // SDK yerine direkt API'ye soruyoruz (En kesin yöntem)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API HATASI:", data.error.message);
            return;
        }

        console.log("\n✅ İŞTE SENİN ANAHTARININ KULLANABİLECEĞİ MODELLER:\n");
        
        const models = data.models || [];
        // Sadece içerik üreten modelleri filtrele
        const chatModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        if (chatModels.length === 0) {
            console.log("⚠️ Hiçbir model bulunamadı. API Key ayarlarında bir sorun olabilir.");
        } else {
            chatModels.forEach(m => console.log(`👉 ${m.name.replace('models/', '')}`));
            
            console.log("\n💡 NE YAPMALISIN?");
            console.log("Yukarıdaki listeden 'gemini' ile başlayan bir ismi kopyala ve index.js dosyandaki MODEL_NAME kısmına yapıştır.");
        }

    } catch (error) {
        console.error("🔥 Bağlantı hatası:", error.message);
    }
}

listModels();