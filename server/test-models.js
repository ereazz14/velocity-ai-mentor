const dotenv = require('dotenv');
// .env dosyasını yükle
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ HATA: .env dosyasında API anahtarı bulunamadı!");
    process.exit(1);
}

// SDK kullanmadan direkt Google sunucularına soruyoruz
async function checkAvailableModels() {
    console.log("🔍 Google API'ye bağlanılıyor ve modeller soruluyor...");
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API HATASI:", data.error.message);
            return;
        }

        console.log("\n✅ BAŞARILI! Senin API Anahtarının kullanabileceği modeller şunlar:\n");
        
        // Sadece "generateContent" özelliğini destekleyen modelleri filtrele
        const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        
        chatModels.forEach(model => {
            console.log(`👉 Model Adı: ${model.name}`); // Örn: models/gemini-pro
        });

        console.log("\n💡 İPUCU: Yukarıdaki 'name' kısmındaki (models/ hariç) ismi index.js dosyana yazmalısın.");

    } catch (error) {
        console.error("🔥 Bağlantı Hatası:", error.message);
    }
}

checkAvailableModels();