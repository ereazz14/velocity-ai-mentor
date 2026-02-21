import { useState } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { 
  Cpu, Send, Loader2, Zap, CheckCircle2, Eye, Lightbulb, 
  Target, Trophy, XOctagon, RefreshCw, Briefcase, ChevronRight, Star 
} from 'lucide-react';


const API_URL = "https://velocity-api-a7xz.onrender.com";

function App() {
  // --- STATE YÖNETİMİ ---
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' | 'roadmap'
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({}); 
  const [feedbacks, setFeedbacks] = useState({}); 
  const [evaluating, setEvaluating] = useState({}); 
  const [modelAnswers, setModelAnswers] = useState({}); 
  const [loadingAnswer, setLoadingAnswer] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [targetRole, setTargetRole] = useState('');
  const [careerPlan, setCareerPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // --- API FONKSİYONLARI ---
  const generateQuestions = async () => {
    if (!jobDescription) return alert("Lütfen iş tanımını girin.");
    setLoading(true); setQuestions(null); setAnswers({}); setFeedbacks({}); setModelAnswers({}); setShowResult(false);
    try {
      const response = await axios.post('${API_URL}/mulakat-uret', { jobDescription });
      let cleanText = typeof response.data.questions === 'string' ? response.data.questions.replace(/```json|```/g, '') : JSON.stringify(response.data.questions);
      setQuestions(JSON.parse(cleanText));
    } catch (error) { alert("Bağlantı hatası."); } finally { setLoading(false); }
  };

  const generateRoadmap = async () => {
      if (!targetRole) return alert("Hedef pozisyonu yazın.");
      setLoadingPlan(true); setCareerPlan(null);
      try {
          const response = await axios.post('${API_URL}/kariyer-plani', { targetRole });
          setCareerPlan(response.data);
      } catch (error) { alert("Plan oluşturulamadı. Lütfen tekrar deneyin."); } finally { setLoadingPlan(false); }
  };

  const checkAnswer = async (index, question) => {
    const userAnswer = answers[index];
    if (!userAnswer) return alert("Cevap alanı boş.");
    setEvaluating(prev => ({ ...prev, [index]: true }));
    try {
      const response = await axios.post('${API_URL}/cevap-degerlendir', { question, userAnswer, jobDescription });
      setFeedbacks(prev => ({ ...prev, [index]: response.data }));
    } catch (error) { alert("Hata!"); } finally { setEvaluating(prev => ({ ...prev, [index]: false })); }
  };

  const showModelAnswer = async (index, question) => {
    if (modelAnswers[index]) return; 
    setLoadingAnswer(prev => ({ ...prev, [index]: true }));
    try {
        const response = await axios.post('${API_URL}/ornek-cevap', { question, jobDescription });
        setModelAnswers(prev => ({ ...prev, [index]: response.data.answer }));
    } catch (error) { alert("Cevap alınamadı."); } finally { setLoadingAnswer(prev => ({ ...prev, [index]: false })); }
  };

  const finishInterview = () => {
      const scores = Object.values(feedbacks).map(f => f.score);
      if (scores.length === 0) return alert("Henüz cevap vermedin!");
      const total = scores.reduce((a, b) => a + b, 0);
      const average = Math.round(total / scores.length);
      setFinalScore(average);
      setShowResult(true);
      if (average >= 7) confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#d946ef', '#8b5cf6', '#06b6d4'] });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-fuchsia-500/30 overflow-x-hidden">
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-12">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-fuchsia-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20 rotate-3 hover:rotate-0 transition-all duration-500">
                <Zap size={28} className="text-white fill-white" />
            </div>
            <div>
                <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    VELOCITY
                </h1>
                <p className="text-xs font-bold text-fuchsia-400 tracking-[0.2em] uppercase">Kariyer Hızlandırıcı</p>
            </div>
          </div>

          {/* NAVİGASYON HAPI */}
          <div className="bg-white/5 backdrop-blur-md p-1 rounded-full border border-white/10 flex">
              <button 
                onClick={() => setActiveTab('interview')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'interview' ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                  <Briefcase size={16}/> Simülasyon
              </button>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'roadmap' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                  <Target size={16}/> Rota Planlayıcı
              </button>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <div className="relative">
            
            {/* ======================= MOD 1: MÜLAKAT ======================= */}
            {activeTab === 'interview' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {showResult ? (
                        /* SONUÇ KARTI */
                        <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-10 rounded-[2.5rem] border border-white/10 text-center relative overflow-hidden shadow-2xl">
                            <div className={`absolute top-0 left-0 w-full h-2 ${finalScore >= 7 ? 'bg-gradient-to-r from-green-400 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}></div>
                            
                            {finalScore >= 7 ? (
                                <div className="inline-flex p-8 bg-emerald-500/10 rounded-full mb-8 ring-1 ring-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                    <Trophy size={64} className="text-emerald-400" />
                                </div>
                            ) : (
                                <div className="inline-flex p-8 bg-red-500/10 rounded-full mb-8 ring-1 ring-red-500/30">
                                    <XOctagon size={64} className="text-red-400" />
                                </div>
                            )}

                            <h2 className="text-5xl font-black mb-4 tracking-tight text-white">
                                {finalScore >= 7 ? "MÜKEMMEL! 🚀" : "DENEYİM KAZANDIN"}
                            </h2>
                            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                                {finalScore >= 7 
                                    ? "Teknik bilgin ve ifade yeteneğin üst seviyede. Bu iş senin olabilir!" 
                                    : "Henüz hazır değilsin ama potansiyelin var. Eksiklerini tamamlayıp tekrar dene."}
                            </p>

                            <div className="bg-black/30 backdrop-blur-sm p-8 rounded-3xl inline-block border border-white/5 min-w-[200px] mb-10">
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block mb-2">PUANIN</span>
                                <div className={`text-7xl font-black tracking-tighter ${finalScore >= 7 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {finalScore}<span className="text-3xl text-slate-600">/10</span>
                                </div>
                            </div>

                            <div>
                                <button 
                                    onClick={() => { setQuestions(null); setShowResult(false); }}
                                    className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-3 mx-auto shadow-xl"
                                >
                                    <RefreshCw size={20} /> Yeni Simülasyon Başlat
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* GİRİŞ VE SORULAR */
                        <>
                            {!questions && (
                            <div className="bg-white/5 backdrop-blur-xl p-1 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                <div className="bg-[#0f1016] rounded-[2.3rem] p-8 md:p-12 relative overflow-hidden">
                                    <div className="relative z-10">
                                        <label className="flex items-center gap-3 text-sm font-bold text-fuchsia-400 mb-6 uppercase tracking-widest">
                                            <Cpu size={18}/> Hedef İş İlanı
                                        </label>
                                        <textarea
                                            className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-200 focus:outline-none focus:border-fuchsia-500/50 focus:bg-white/10 transition-all resize-none text-xl leading-relaxed placeholder:text-slate-700 font-medium"
                                            placeholder="Örn: React Developer, Node.js, Takım oyuncusu..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                        />
                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={generateQuestions}
                                                disabled={loading}
                                                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-fuchsia-600/20 flex items-center gap-3"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : <Zap size={24} className="fill-white" />}
                                                {loading ? "Analiz Ediliyor..." : "SİSTEMİ BAŞLAT"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}

                            {questions && (
                            <div className="space-y-12">
                                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                            Mülakat Odası
                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md border border-green-500/30 animate-pulse">CANLI</span>
                                        </h2>
                                        <p className="text-slate-400">Yapay zeka seni zorlayacak. Hazır mısın?</p>
                                    </div>
                                    <button onClick={finishInterview} className="text-red-400 hover:text-red-300 font-bold text-sm border-b border-red-500/30 hover:border-red-400 transition-all pb-1">Simülasyonu Bitir</button>
                                </div>

                                {questions.questions.map((soru, index) => (
                                <div key={index} className="group relative">
                                    {/* Soru Numarası */}
                                    <div className="absolute -left-4 -top-4 w-10 h-10 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center font-bold text-slate-300 z-10 shadow-lg">
                                        {index + 1}
                                    </div>
                                    
                                    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500">
                                        <div className="p-8">
                                            <h3 className="text-2xl font-semibold text-white mb-6 leading-snug">{soru}</h3>
                                            
                                            <textarea
                                                disabled={!!feedbacks[index]}
                                                value={answers[index] || ''}
                                                onChange={(e) => setAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                                className={`w-full p-6 rounded-2xl bg-black/40 border text-slate-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 transition-all resize-none text-lg ${feedbacks[index] ? 'border-green-500/20 opacity-50' : 'border-white/10 focus:border-fuchsia-500/50'}`}
                                                placeholder="Cevabınızı buraya yazın..."
                                                rows={5}
                                            />

                                            {!feedbacks[index] && (
                                                <div className="flex items-center justify-between mt-6 gap-4">
                                                    <button
                                                        onClick={() => showModelAnswer(index, soru)}
                                                        disabled={loadingAnswer[index]}
                                                        className="text-slate-400 hover:text-white text-sm font-semibold flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                                                    >
                                                        {loadingAnswer[index] ? <Loader2 className="animate-spin" size={16}/> : <Eye size={18}/>}
                                                        {modelAnswers[index] ? "Cevabı Gizle" : "Kopya Çek / İpucu"}
                                                    </button>

                                                    <button
                                                        onClick={() => checkAnswer(index, soru)}
                                                        disabled={!answers[index] || evaluating[index]}
                                                        className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100 active:scale-95"
                                                    >
                                                        {evaluating[index] ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                                                        {evaluating[index] ? "Puanlanıyor..." : "GÖNDER"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* HAP BİLGİ (İPUCU) */}
                                        {modelAnswers[index] && !feedbacks[index] && (
                                            <div className="bg-indigo-950/30 border-t border-white/5 p-6 animate-in slide-in-from-top-2">
                                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                                                    <Lightbulb size={14}/> Velocity AI Önerisi
                                                </div>
                                                <p className="text-indigo-100/80 leading-relaxed whitespace-pre-line">{modelAnswers[index]}</p>
                                            </div>
                                        )}

                                        {/* DEĞERLENDİRME SONUCU */}
                                        {feedbacks[index] && (
                                            <div className="bg-gradient-to-br from-slate-900 to-black p-8 border-t border-white/10 animate-in fade-in">
                                                <div className="flex items-start gap-6">
                                                    <div className={`text-4xl font-black px-6 py-4 rounded-2xl border ${feedbacks[index].score >= 7 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                        {feedbacks[index].score}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-white font-bold text-lg mb-1">Mentor Geri Bildirimi</h4>
                                                        <p className="text-slate-400 leading-relaxed">{feedbacks[index].feedback}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Cevabı göster butonu (Sonuçtan sonra) */}
                                                <div className="mt-6 pt-6 border-t border-white/5">
                                                     <button onClick={() => showModelAnswer(index, soru)} className="text-fuchsia-400 hover:text-fuchsia-300 text-sm font-medium flex items-center gap-2 transition-colors">
                                                        <Star size={14}/> İdeal cevabı görüntüle
                                                     </button>
                                                     {modelAnswers[index] && (
                                                         <div className="mt-4 text-slate-300 text-sm p-4 bg-white/5 rounded-xl whitespace-pre-line border border-white/5">
                                                             {modelAnswers[index]}
                                                         </div>
                                                     )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                ))}

                                <div className="flex justify-center pt-8 pb-20">
                                    <button 
                                        onClick={finishInterview}
                                        className="group relative px-12 py-5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl font-bold text-xl text-white shadow-2xl shadow-rose-900/50 hover:scale-105 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full"></div>
                                        <span className="relative flex items-center gap-3">
                                            Mülakatı Sonlandır <ChevronRight />
                                        </span>
                                    </button>
                                </div>
                            </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ======================= MOD 2: ROTA ======================= */}
            {activeTab === 'roadmap' && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {!careerPlan ? (
                        <div className="bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-950 p-1 rounded-[2.5rem] border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                             
                             <div className="bg-[#0f1016] rounded-[2.3rem] p-10 md:p-16 text-center relative z-10">
                                <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 rotate-12">
                                    <Target size={40} className="text-indigo-400" />
                                </div>
                                
                                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Kariyer Rotanı Çizelim</h2>
                                <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
                                    Hangi alanda uzmanlaşmak istiyorsun? Yapay zeka sana özel 4 haftalık "Zero to Hero" planı hazırlasın.
                                </p>
                                
                                <div className="max-w-xl mx-auto relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-center text-2xl font-bold text-white focus:border-indigo-500 transition-colors placeholder:text-slate-700 outline-none"
                                        placeholder="Örn: Cyber Security, DevOps..."
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                    />
                                    <button 
                                        onClick={generateRoadmap}
                                        disabled={loadingPlan}
                                        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loadingPlan ? <Loader2 className="animate-spin"/> : <Zap size={24} className="fill-white"/>}
                                        {loadingPlan ? "ROTA HESAPLANIYOR..." : "ROTAYI OLUŞTUR"}
                                    </button>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                        <span className="text-indigo-400">{targetRole}</span> Yol Haritası
                                    </h2>
                                    <p className="text-slate-400 mt-1">Sana özel hazırlanmış 4 haftalık hızlandırma programı.</p>
                                </div>
                                <button onClick={() => setCareerPlan(null)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors">Yeni Rota</button>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {careerPlan.weeks.map((week, index) => (
                                    <div key={index} className="bg-[#12141f] border border-white/5 p-8 rounded-3xl hover:border-indigo-500/50 transition-all duration-300 group shadow-lg">
                                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                            {index + 1}. Hafta
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">{week.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">{week.task}</p>
                                    </div>
                                ))}
                            </div>

                            {/* MENTOR NOTLARI */}
                            <div className="bg-gradient-to-r from-fuchsia-900/20 to-indigo-900/20 border border-fuchsia-500/20 rounded-[2rem] p-10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5"><Target size={200} /></div>
                                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                    <Star className="text-yellow-400 fill-yellow-400" /> Mentorun Altın Tavsiyeleri
                                </h3>
                                <div className="grid gap-4 relative z-10">
                                    {careerPlan.tips.map((tip, index) => (
                                        <div key={index} className="bg-black/40 backdrop-blur-md p-5 rounded-xl border border-white/5 flex gap-4 items-start">
                                            <div className="bg-fuchsia-500/20 text-fuchsia-400 font-bold w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm">
                                                {index + 1}
                                            </div>
                                            <p className="text-slate-200 font-medium pt-1">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
        </div>
      </div>
    </div>
  );
}

export default App;