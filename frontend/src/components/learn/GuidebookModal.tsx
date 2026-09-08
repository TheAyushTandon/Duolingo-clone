"use client";

import React from "react";
import { X, Volume2, BookOpen, Sparkles } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";

interface GuidebookModalProps {
  unitIndex: number;
  unitTitle: string;
  onClose: () => void;
}

const PHRASES = [
  { es: "¡Hola! Mucho gusto.", en: "Hello! Nice to meet you.", hi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
  { es: "Buenos días, ¿cómo estás?", en: "Good morning, how are you?", hi: "सुप्रभात, आप कैसे हैं?" },
  { es: "Por favor y gracias.", en: "Please and thank you.", hi: "कृपया और धन्यवाद।" },
  { es: "Un café con leche, por favor.", en: "A coffee with milk, please.", hi: "कृपया एक कॉफ़ी दूध के साथ।" },
  { es: "¿Dónde está el baño?", en: "Where is the bathroom?", hi: "शौचालय कहाँ है?" },
  { es: "Hablo un poco de español.", en: "I speak a little Spanish.", hi: "मैं थोड़ी स्पैनिश बोलता हूँ।" },
];

export function GuidebookModal({ unitIndex, unitTitle, onClose }: GuidebookModalProps) {
  const { playClick, speak } = useSound();
  const { t, language } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-[#58cc02]">
            <BookOpen size={24} />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                {t("Unit")} {unitIndex} {t("Guidebook")}
              </span>
              <h3 className="font-black text-lg text-slate-800 leading-none">
                {unitTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Key Phrases Section */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#ffc800]" />
              {t("Essential Key Phrases")}
            </h4>
            <div className="grid gap-2.5">
              {PHRASES.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors"
                >
                  <div>
                    <span className="font-black text-slate-800 text-sm block">
                      {item.es}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {language === "hi" ? item.hi : item.en}
                    </span>
                  </div>
                  <button
                    onClick={() => speak(item.es, "es-ES")}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-[#1cb0f6] hover:bg-sky-50 transition-colors"
                    title="Pronounce phrase"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Grammar Tips */}
          <div className="p-4 rounded-2xl bg-[#ddf4ff] border-2 border-[#84d8ff]">
            <h5 className="font-black text-sm text-[#1899d6] mb-1">
              {t("Grammar Tip: Genders & Articles")}
            </h5>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              {language === "hi"
                ? "स्पैनिश में संज्ञाएं या तो पुल्लिंग होती हैं या स्त्रीलिंग। -o पर समाप्त होने वाले शब्द आमतौर पर पुल्लिंग होते हैं (जैसे el café, el niño), जबकि -a पर समाप्त होने वाले शब्द आमतौर पर स्त्रीलिंग होते हैं (जैसे la manzana, la niña)।"
                : "In Spanish, nouns are either masculine or feminine. Words ending in -o are usually masculine (e.g., el café, el niño), while words ending in -a are usually feminine (e.g., la manzana, la niña)."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-slate-100 mt-4">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider hover:bg-[#46a302] shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all"
          >
            {t("GOT IT")}
          </button>
        </div>
      </div>
    </div>
  );
}
