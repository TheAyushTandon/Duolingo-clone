"use client";

import React from "react";
import { X, Volume2, BookOpen } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTranslation } from "@/stores/useLanguageStore";
import { useLearningPath } from "@/hooks/useUserData";

interface GuidebookModalProps {
  unitIndex: number;
  unitTitle: string;
  courseCode?: string;
  speechLocale?: string;
  onClose: () => void;
}

interface GuidebookPhrase {
  text: string;
  meaningEn: string;
  meaningHi: string;
}

interface CourseGuidebookData {
  locale: string;
  languageName: string;
  phrases: GuidebookPhrase[];
  grammarTip: {
    titleEn: string;
    titleHi: string;
    bodyEn: string;
    bodyHi: string;
  };
}

const COURSE_GUIDEBOOKS: Record<string, CourseGuidebookData> = {
  en: {
    locale: "en-US",
    languageName: "English",
    phrases: [
      { text: "Hello! Nice to meet you.", meaningEn: "Greeting someone politely", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
      { text: "Good morning, how are you?", meaningEn: "Polite morning greeting", meaningHi: "सुप्रभात, आप कैसे हैं?" },
      { text: "Could you please help me?", meaningEn: "Asking for assistance politely", meaningHi: "क्या आप कृपया मेरी मदद कर सकते हैं?" },
      { text: "Thank you very much!", meaningEn: "Expressing sincere gratitude", meaningHi: "बहुत-बहुत धन्यवाद!" },
      { text: "Where is the train station?", meaningEn: "Asking for directions", meaningHi: "रेलवे स्टेशन कहाँ है?" },
      { text: "Have a wonderful day!", meaningEn: "Wishing someone well", meaningHi: "आपका दिन बहुत शुभ हो!" },
    ],
    grammarTip: {
      titleEn: "Grammar Tip: Articles 'A', 'An', and 'The'",
      titleHi: "व्याकरण सुझाव: 'A', 'An', और 'The' उपपद",
      bodyEn: "Use 'a' before words starting with consonant sounds (e.g., 'a cat', 'a book') and 'an' before vowel sounds (e.g., 'an apple', 'an hour'). Use 'the' when referring to a specific item known to the listener.",
      bodyHi: "व्यंजन ध्वनियों से शुरू होने वाले शब्दों से पहले 'a' (जैसे 'a cat', 'a book') और स्वर ध्वनियों से पहले 'an' (जैसे 'an apple', 'an hour') का उपयोग करें। किसी विशिष्ट वस्तु के लिए 'the' का उपयोग करें।",
    },
  },
  fr: {
    locale: "fr-FR",
    languageName: "French",
    phrases: [
      { text: "Bonjour ! Enchanté.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
      { text: "Comment allez-vous ?", meaningEn: "How are you? (formal)", meaningHi: "आप कैसे हैं?" },
      { text: "S'il vous plaît et merci.", meaningEn: "Please and thank you.", meaningHi: "कृपया और धन्यवाद।" },
      { text: "Un café au lait, s'il vous plaît.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
      { text: "Où sont les toilettes ?", meaningEn: "Where is the restroom?", meaningHi: "शौचालय कहाँ है?" },
      { text: "Passez une bonne journée !", meaningEn: "Have a good day!", meaningHi: "आपका दिन शुभ हो!" },
    ],
    grammarTip: {
      titleEn: "Grammar Tip: French Genders & Articles",
      titleHi: "व्याकरण सुझाव: फ़्रेंच लिंग और उपपद",
      bodyEn: "In French, all nouns are either masculine ('le/un') or feminine ('la/une'). Before a vowel or silent h, 'le' and 'la' contract to 'l'' (e.g., 'l'eau'). Adjectives must agree in gender with the nouns they describe.",
      bodyHi: "फ़्रेंच में सभी संज्ञाएं या तो पुल्लिंग ('le/un') होती हैं या स्त्रीलिंग ('la/une')। स्वर से पहले 'le' और 'la' बदलकर 'l'' बन जाते हैं (जैसे 'l'eau')। विशेषण भी संज्ञा के लिंग के अनुसार बदलते हैं।",
    },
  },
  es: {
    locale: "es-ES",
    languageName: "Spanish",
    phrases: [
      { text: "¡Hola! Mucho gusto.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
      { text: "Buenos días, ¿cómo estás?", meaningEn: "Good morning, how are you?", meaningHi: "सुप्रभात, आप कैसे हैं?" },
      { text: "Por favor y gracias.", meaningEn: "Please and thank you.", meaningHi: "कृपया और धन्यवाद।" },
      { text: "Un café con leche, por favor.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
      { text: "¿Dónde está el baño?", meaningEn: "Where is the bathroom?", meaningHi: "शौचालय कहाँ है?" },
      { text: "¡Que tengas un excelente día!", meaningEn: "Have an excellent day!", meaningHi: "आपका दिन बहुत अच्छा रहे!" },
    ],
    grammarTip: {
      titleEn: "Grammar Tip: Genders & Articles",
      titleHi: "व्याकरण सुझाव: लिंग और उपपद",
      bodyEn: "In Spanish, nouns are either masculine or feminine. Words ending in -o are usually masculine (e.g., el café, el niño), while words ending in -a are usually feminine (e.g., la manzana, la niña). Plural nouns take 'los' or 'las'.",
      bodyHi: "स्पैनिश में संज्ञाएं या तो पुल्लिंग होती हैं या स्त्रीलिंग। -o पर समाप्त होने वाले शब्द आमतौर पर पुल्लिंग होते हैं (जैसे el café, el niño), जबकि -a पर समाप्त होने वाले शब्द आमतौर पर स्त्रीलिंग होते हैं (जैसे la manzana, la niña)।",
    },
  },
  de: {
    locale: "de-DE",
    languageName: "German",
    phrases: [
      { text: "Hallo! Freut mich.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
      { text: "Guten Morgen, wie geht es Ihnen?", meaningEn: "Good morning, how are you?", meaningHi: "सुप्रभात, आप कैसे हैं?" },
      { text: "Bitte und vielen Dank.", meaningEn: "Please and thank you very much.", meaningHi: "कृपया और बहुत धन्यवाद।" },
      { text: "Einen Kaffee mit Milch, bitte.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
      { text: "Wo ist die Haltestelle?", meaningEn: "Where is the station/stop?", meaningHi: "स्टेशन कहाँ है?" },
      { text: "Ich wünsche Ihnen einen schönen Tag!", meaningEn: "Have a nice day!", meaningHi: "आपका दिन शुभ हो!" },
    ],
    grammarTip: {
      titleEn: "Grammar Tip: German Genders & Capitalization",
      titleHi: "व्याकरण सुझाव: जर्मन लिंग और बड़े अक्षर",
      bodyEn: "German has three genders: masculine ('der'), feminine ('die'), and neuter ('das'). Remember that ALL German nouns are always capitalized, regardless of where they appear in a sentence!",
      bodyHi: "जर्मन में तीन लिंग होते हैं: पुल्लिंग ('der'), स्त्रीलिंग ('die'), और नपुंसकलिंग ('das')। याद रखें कि जर्मन में सभी संज्ञाएं हमेशा बड़े अक्षर (Capitalized) से शुरू होती हैं!",
    },
  },
  it: {
    locale: "it-IT",
    languageName: "Italian",
    phrases: [
      { text: "Ciao! Piacere di conoscerti.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
      { text: "Buongiorno, come stai?", meaningEn: "Good morning, how are you?", meaningHi: "सुप्रभात, आप कैसे हैं?" },
      { text: "Per favore e grazie mille.", meaningEn: "Please and thank you very much.", meaningHi: "कृपया और बहुत धन्यवाद।" },
      { text: "Un cappuccino, per favore.", meaningEn: "A cappuccino, please.", meaningHi: "कृपया एक कैप्पुचीनो।" },
      { text: "Dov'è la stazione?", meaningEn: "Where is the train station?", meaningHi: "रेलवे स्टेशन कहाँ है?" },
      { text: "Buona giornata!", meaningEn: "Have a wonderful day!", meaningHi: "आपका दिन शुभ हो!" },
    ],
    grammarTip: {
      titleEn: "Grammar Tip: Italian Articles & Vowels",
      titleHi: "व्याकरण सुझाव: इतालवी उपपद और स्वर",
      bodyEn: "In Italian, masculine nouns generally end in -o (plural in -i), while feminine nouns generally end in -a (plural in -e). Definite articles include 'il', 'lo', 'la', and 'l'' depending on the following letter.",
      bodyHi: "इतालवी में पुल्लिंग संज्ञाएं आमतौर पर -o (बहुवचन -i) पर समाप्त होती हैं, और स्त्रीलिंग संज्ञाएं आमतौर पर -a (बहुवचन -e) पर समाप्त होती हैं।",
    },
  },
};

export function GuidebookModal({
  unitIndex,
  unitTitle,
  courseCode,
  speechLocale,
  onClose,
}: GuidebookModalProps) {
  const { playClick, speak } = useSound();
  const { t, language } = useTranslation();
  const { data: pathData } = useLearningPath();

  // Resolve the active course code (e.g. "en", "fr", "es", "de", "it")
  const rawCode = (courseCode || pathData?.course?.code || "en").toLowerCase();
  const activeCourse = COURSE_GUIDEBOOKS[rawCode] || COURSE_GUIDEBOOKS["en"];
  const activeLocale = speechLocale || pathData?.course?.speech_locale || activeCourse.locale;

  const { phrases, grammarTip } = activeCourse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5 text-[#58cc02]">
            <BookOpen size={24} />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                {t("Unit")} {unitIndex} {t("Guidebook")} · {activeCourse.languageName}
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close guidebook"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto pr-1 space-y-5 flex-1">
          {/* Key Phrases Section */}
          <div>
            <h4 className="font-black text-sm uppercase tracking-wider text-slate-700 mb-3">
              {t("Essential Key Phrases")}
            </h4>
            <div className="grid gap-2.5">
              {phrases.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors"
                >
                  <div className="space-y-0.5 pr-2">
                    <span className="font-black text-slate-800 text-sm block">
                      {item.text}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 block">
                      {language === "hi" ? item.meaningHi : item.meaningEn}
                    </span>
                  </div>
                  <button
                    onClick={() => speak(item.text, activeLocale)}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-[#1cb0f6] hover:bg-sky-50 transition-colors shrink-0 cursor-pointer shadow-xs"
                    title={`Pronounce in ${activeCourse.languageName}`}
                    aria-label={`Pronounce: ${item.text}`}
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
              {language === "hi" ? grammarTip.titleHi : grammarTip.titleEn}
            </h5>
            <p className="text-xs font-bold text-slate-700 leading-relaxed">
              {language === "hi" ? grammarTip.bodyHi : grammarTip.bodyEn}
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
            className="w-full py-3 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider hover:bg-[#46a302] shadow-[0_4px_0_#46a302] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            {t("GOT IT")}
          </button>
        </div>
      </div>
    </div>
  );
}
