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
  units: Record<number, {
    phrases: GuidebookPhrase[];
    grammarTip: {
      titleEn: string;
      titleHi: string;
      bodyEn: string;
      bodyHi: string;
    };
  }>;
}

const COURSE_GUIDEBOOKS: Record<string, CourseGuidebookData> = {
  en: {
    locale: "en-US",
    languageName: "English",
    units: {
      1: {
        phrases: [
          { text: "Hello! Nice to meet you.", meaningEn: "Greeting someone politely", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
          { text: "Good morning, how are you?", meaningEn: "Polite morning greeting", meaningHi: "सुप्रभात, आप कैसे हैं?" },
          { text: "Could you please help me?", meaningEn: "Asking for assistance politely", meaningHi: "क्या आप कृपया मेरी मदद कर सकते हैं?" },
          { text: "Thank you very much!", meaningEn: "Expressing sincere gratitude", meaningHi: "बहुत-बहुत धन्यवाद!" },
          { text: "Have a wonderful day!", meaningEn: "Wishing someone well", meaningHi: "आपका दिन बहुत शुभ हो!" },
          { text: "See you later, take care!", meaningEn: "Warm casual farewell", meaningHi: "फिर मिलेंगे, अपना ख्याल रखना!" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Articles 'A', 'An', and 'The'",
          titleHi: "व्याकरण सुझाव: 'A', 'An', और 'The' उपपद",
          bodyEn: "Use 'a' before words starting with consonant sounds ('a cat', 'a university') and 'an' before vowel sounds ('an apple', 'an hour'). Use 'the' when referring to a specific item known to both speakers.",
          bodyHi: "व्यंजन ध्वनियों से शुरू होने वाले शब्दों से पहले 'a' (जैसे 'a cat', 'a university') और स्वर ध्वनियों से पहले 'an' (जैसे 'an apple', 'an hour') का उपयोग करें। किसी विशिष्ट वस्तु के लिए 'the' का उपयोग करें।",
        },
      },
      2: {
        phrases: [
          { text: "Where is the nearest train station?", meaningEn: "Asking for specific directions", meaningHi: "निकटतम रेलवे स्टेशन कहाँ है?" },
          { text: "She walks to school every morning.", meaningEn: "Describing a daily habit", meaningHi: "वह हर सुबह स्कूल पैदल जाती है।" },
          { text: "What time does the lesson start?", meaningEn: "Inquiring about schedules", meaningHi: "पाठ किस समय शुरू होता है?" },
          { text: "They are studying in the library right now.", meaningEn: "Describing an ongoing action", meaningHi: "वे अभी पुस्तकालय में पढ़ाई कर रहे हैं।" },
          { text: "I would like to order a cup of coffee.", meaningEn: "Ordering politely in a café", meaningHi: "मैं एक कप कॉफ़ी ऑर्डर करना चाहूँगा।" },
          { text: "Can you please repeat that slowly?", meaningEn: "Requesting polite clarification", meaningHi: "क्या आप कृपया इसे धीरे से दोहरा सकते हैं?" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Present Simple vs. Continuous",
          titleHi: "व्याकरण सुझाव: सामान्य वर्तमान काल बनाम निरंतर वर्तमान काल",
          bodyEn: "Use Present Simple for daily habits and facts ('She walks to school'). Remember to add -s/-es for he/she/it! Use Present Continuous ('is/are + verb-ing') for actions happening right now ('They are studying').",
          bodyHi: "दैनिक आदतों और सत्यों के लिए Present Simple का प्रयोग करें ('She walks to school')। He/she/it के साथ -s/-es जोड़ें! वर्तमान में हो रही क्रियाओं के लिए Present Continuous ('is/are + verb-ing') का प्रयोग करें।",
        },
      },
    },
  },
  fr: {
    locale: "fr-FR",
    languageName: "French",
    units: {
      1: {
        phrases: [
          { text: "Bonjour ! Enchanté.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
          { text: "Comment allez-vous ?", meaningEn: "How are you? (formal)", meaningHi: "आप कैसे हैं?" },
          { text: "S'il vous plaît et merci.", meaningEn: "Please and thank you.", meaningHi: "कृपया और धन्यवाद।" },
          { text: "Un chat et un chien.", meaningEn: "A cat and a dog.", meaningHi: "एक बिल्ली और एक कुत्ता।" },
          { text: "Une pomme rouge, s'il vous plaît.", meaningEn: "A red apple, please.", meaningHi: "कृपया एक लाल सेब।" },
          { text: "Au revoir, bonne journée !", meaningEn: "Goodbye, have a good day!", meaningHi: "अलविदा, आपका दिन शुभ हो!" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: French Genders & Articles",
          titleHi: "व्याकरण सुझाव: फ़्रेंच लिंग और उपपद",
          bodyEn: "In French, all nouns are either masculine ('un / le') or feminine ('une / la'). Before a vowel or silent h, 'le' and 'la' contract to 'l'' (e.g., 'l'eau', 'l'homme'). Adjectives must agree in gender with the noun.",
          bodyHi: "फ़्रेंच में सभी संज्ञाएं या तो पुल्लिंग ('un / le') होती हैं या स्त्रीलिंग ('une / la')। स्वर से पहले 'le' और 'la' बदलकर 'l'' बन जाते हैं (जैसे 'l'eau')। विशेषण भी संज्ञा के लिंग के अनुसार बदलते हैं।",
        },
      },
      2: {
        phrases: [
          { text: "Je mange du pain frais.", meaningEn: "I am eating fresh bread.", meaningHi: "मैं ताज़ा ब्रेड खा रहा हूँ।" },
          { text: "Où sont les toilettes ?", meaningEn: "Where is the restroom?", meaningHi: "शौचालय कहाँ है?" },
          { text: "Il marche vite vers la gare.", meaningEn: "He walks quickly toward the station.", meaningHi: "वह तेज़ी से रेलवे स्टेशन की ओर चल रहा है।" },
          { text: "Nous habitons dans une grande ville.", meaningEn: "We live in a big city.", meaningHi: "हम एक बड़े शहर में रहते हैं।" },
          { text: "Comment vous appelez-vous ?", meaningEn: "What is your name? (formal)", meaningHi: "आपका नाम क्या है?" },
          { text: "Un café au lait, s'il vous plaît.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Regular -ER Verb Conjugations",
          titleHi: "व्याकरण सुझाव: नियमित -ER क्रिया रूप",
          bodyEn: "Most French verbs end in -er (e.g., 'parler', 'marcher', 'manger'). Drop the -er and add: Je -> -e, Tu -> -es, Il/Elle -> -e, Nous -> -ons, Vous -> -ez, Ils/Elles -> -ent. Example: 'Je parle' (I speak), 'Nous parlons' (We speak).",
          bodyHi: "अधिकांश फ़्रेंच क्रियाएं -er पर समाप्त होती हैं (जैसे 'parler')। -er हटाकर जोड़ें: Je -> -e (Je parle), Tu -> -es, Il/Elle -> -e, Nous -> -ons (Nous parlons), Vous -> -ez, Ils/Elles -> -ent।",
        },
      },
    },
  },
  es: {
    locale: "es-ES",
    languageName: "Spanish",
    units: {
      1: {
        phrases: [
          { text: "¡Hola! Mucho gusto.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
          { text: "Buenos días, ¿cómo estás?", meaningEn: "Good morning, how are you?", meaningHi: "सुप्रभात, आप कैसे हैं?" },
          { text: "Por favor y gracias.", meaningEn: "Please and thank you.", meaningHi: "कृपया और धन्यवाद।" },
          { text: "Una manzana y un vaso de agua.", meaningEn: "An apple and a glass of water.", meaningHi: "एक सेब और एक गिलास पानी।" },
          { text: "¿Cómo te llamas?", meaningEn: "What is your name?", meaningHi: "तुम्हारा नाम क्या है?" },
          { text: "¡Que tengas un excelente día!", meaningEn: "Have an excellent day!", meaningHi: "आपका दिन बहुत अच्छा रहे!" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Spanish Genders & Articles",
          titleHi: "व्याकरण सुझाव: लिंग और उपपद",
          bodyEn: "In Spanish, nouns are either masculine or feminine. Words ending in -o are usually masculine ('el niño', 'el libro'), while words ending in -a are usually feminine ('la niña', 'la manzana'). Plurals take 'los' or 'las'.",
          bodyHi: "स्पैनिश में संज्ञाएं या तो पुल्लिंग होती हैं या स्त्रीलिंग। -o पर समाप्त होने वाले शब्द आमतौर पर पुल्लिंग (el libro) और -a पर समाप्त होने वाले स्त्रीलिंग (la manzana) होते हैं।",
        },
      },
      2: {
        phrases: [
          { text: "Yo hablo un poco de español.", meaningEn: "I speak a little Spanish.", meaningHi: "मैं थोड़ी स्पैनिश बोलता हूँ।" },
          { text: "¿Dónde está la estación de trenes?", meaningEn: "Where is the train station?", meaningHi: "रेलवे स्टेशन कहाँ है?" },
          { text: "Ella vive en una casa bonita.", meaningEn: "She lives in a pretty house.", meaningHi: "वह एक सुंदर घर में रहती है।" },
          { text: "¿Cuánto cuesta este billete?", meaningEn: "How much is this ticket?", meaningHi: "इस टिकट की कीमत कितनी है?" },
          { text: "Nosotros comemos en el restaurante.", meaningEn: "We eat at the restaurant.", meaningHi: "हम रेस्टोरेंट में खाना खाते हैं।" },
          { text: "Un café con leche, por favor.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Present Tense -AR Verbs",
          titleHi: "व्याकरण सुझाव: -AR क्रियाओं का वर्तमान काल",
          bodyEn: "For regular -ar verbs like 'hablar' (to speak): Yo hablo, Tú hablas, Él/Ella habla, Nosotros hablamos, Ellos/Ellas hablan. Pronouns (yo, tú) can often be omitted because verb endings specify the subject!",
          bodyHi: "नियमित -ar क्रियाओं के लिए (जैसे hablar): Yo hablo (मैं बोलता हूँ), Tú hablas, Él habla, Nosotros hablamos। क्रिया के अंत से ही कर्ता स्पष्ट हो जाता है।",
        },
      },
    },
  },
  de: {
    locale: "de-DE",
    languageName: "German",
    units: {
      1: {
        phrases: [
          { text: "Hallo! Freut mich sehr.", meaningEn: "Hello! Pleased to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
          { text: "Guten Morgen, wie geht es Ihnen?", meaningEn: "Good morning, how are you? (formal)", meaningHi: "सुप्रभात, आप कैसे हैं?" },
          { text: "Bitte und vielen Dank.", meaningEn: "Please and thank you very much.", meaningHi: "कृपया और बहुत धन्यवाद।" },
          { text: "Ein Brot und ein Wasser, bitte.", meaningEn: "Bread and water, please.", meaningHi: "कृपया रोटी और पानी।" },
          { text: "Wie heißt du?", meaningEn: "What is your name?", meaningHi: "तुम्हारा नाम क्या है?" },
          { text: "Ich wünsche Ihnen einen schönen Tag!", meaningEn: "Have a nice day!", meaningHi: "आपका दिन शुभ हो!" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: German Genders & Capitalization",
          titleHi: "व्याकरण सुझाव: जर्मन लिंग और बड़े अक्षर",
          bodyEn: "German has three genders: masculine ('der'), feminine ('die'), and neuter ('das'). Remember that ALL German nouns are always capitalized, regardless of where they appear in a sentence!",
          bodyHi: "जर्मन में तीन लिंग होते हैं: पुल्लिंग ('der'), स्त्रीलिंग ('die'), और नपुंसकलिंग ('das')। याद रखें कि जर्मन में सभी संज्ञाएं हमेशा बड़े अक्षर (Capitalized) से शुरू होती हैं!",
        },
      },
      2: {
        phrases: [
          { text: "Ich lerne jeden Tag Deutsch.", meaningEn: "I learn German every day.", meaningHi: "मैं हर दिन जर्मन सीखता हूँ।" },
          { text: "Wo ist die nächste Haltestelle?", meaningEn: "Where is the nearest stop/station?", meaningHi: "निकटतम स्टेशन कहाँ है?" },
          { text: "Er trinkt gerne Tee am Morgen.", meaningEn: "He likes drinking tea in the morning.", meaningHi: "वह सुबह चाय पीना पसंद करता है।" },
          { text: "Wir wohnen in einer schönen Stadt.", meaningEn: "We live in a beautiful city.", meaningHi: "हम एक सुंदर शहर में रहते हैं।" },
          { text: "Was möchten Sie trinken?", meaningEn: "What would you like to drink? (formal)", meaningHi: "आप क्या पीना पसंद करेंगे?" },
          { text: "Einen Kaffee mit Milch, bitte.", meaningEn: "A coffee with milk, please.", meaningHi: "कृपया एक कॉफ़ी दूध के साथ।" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Verb in Second Position (V2 Rule)",
          titleHi: "व्याकरण सुझाव: क्रिया का दूसरा स्थान (V2 नियम)",
          bodyEn: "In normal German main clauses, the conjugated verb must always take the SECOND position. Even if you begin with time or location ('Heute lerne ich Deutsch'), the verb comes right after the first element!",
          bodyHi: "जर्मन के मुख्य वाक्यों में मुख्य क्रिया हमेशा दूसरे स्थान पर आती है (V2 नियम)। यदि वाक्य समय से शुरू हो ('Heute lerne ich'), तब भी क्रिया दूसरे स्थान पर ही रहेगी।",
        },
      },
    },
  },
  it: {
    locale: "it-IT",
    languageName: "Italian",
    units: {
      1: {
        phrases: [
          { text: "Ciao! Piacere di conoscerti.", meaningEn: "Hello! Nice to meet you.", meaningHi: "नमस्ते! आपसे मिलकर खुशी हुई।" },
          { text: "Buongiorno, come stai?", meaningEn: "Good morning, how are you?", meaningHi: "सुप्रभात, आप कैसे हैं?" },
          { text: "Per favore e grazie mille.", meaningEn: "Please and thank you very much.", meaningHi: "कृपया और बहुत धन्यवाद।" },
          { text: "Una mela e un bicchiere d'acqua.", meaningEn: "An apple and a glass of water.", meaningHi: "एक सेब और एक गिलास पानी।" },
          { text: "Come ti chiami?", meaningEn: "What is your name?", meaningHi: "तुम्हारा नाम क्या है?" },
          { text: "Buona giornata a tutti!", meaningEn: "Have a wonderful day everyone!", meaningHi: "आप सभी का दिन शुभ हो!" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Italian Articles & Vowels",
          titleHi: "व्याकरण सुझाव: इतालवी उपपद और स्वर",
          bodyEn: "In Italian, masculine nouns generally end in -o (plural in -i), while feminine nouns generally end in -a (plural in -e). Definite articles include 'il', 'lo', 'la', and 'l'' depending on the following letter.",
          bodyHi: "इतालवी में पुल्लिंग संज्ञाएं आमतौर पर -o (बहुवचन -i) पर समाप्त होती हैं, और स्त्रीलिंग संज्ञाएं आमतौर पर -a (बहुवचन -e) पर समाप्त होती हैं।",
        },
      },
      2: {
        phrases: [
          { text: "Io parlo un po' d'italiano.", meaningEn: "I speak a little Italian.", meaningHi: "मैं थोड़ी इतालवी बोलता हूँ।" },
          { text: "Dov'è la stazione ferroviaria?", meaningEn: "Where is the train station?", meaningHi: "रेलवे स्टेशन कहाँ है?" },
          { text: "Noi abitiamo vicino al centro.", meaningEn: "We live near the center.", meaningHi: "हम केंद्र के पास रहते हैं।" },
          { text: "Prendo un cornetto e un cappuccino.", meaningEn: "I'll have a croissant and cappuccino.", meaningHi: "मैं एक क्रोइसैन और कैप्पुचीनो लूँगा।" },
          { text: "Quanto costa questo biglietto?", meaningEn: "How much is this ticket?", meaningHi: "इस टिकट की कीमत कितनी है?" },
          { text: "Un cappuccino, per favore.", meaningEn: "A cappuccino, please.", meaningHi: "कृपया एक कैप्पुचीनो।" },
        ],
        grammarTip: {
          titleEn: "Grammar Tip: Regular -ARE Verb Endings",
          titleHi: "व्याकरण सुझाव: नियमित -ARE क्रिया रूप",
          bodyEn: "For regular -are verbs like 'parlare' (to speak): Io parlo, Tu parli, Lui/Lei parla, Noi parliamo, Voi parlate, Loro parlano. Subject pronouns can usually be dropped since the verb ending makes the subject obvious!",
          bodyHi: "नियमित -are क्रियाओं के लिए (जैसे parlare): Io parlo, Tu parli, Lui parla, Noi parliamo। क्रिया के अंत से ही कर्ता स्पष्ट हो जाता है।",
        },
      },
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

  // Resolve unit-specific content (fallback to unit 1 if unitIndex is not explicitly keyed)
  const resolvedUnitNum = unitIndex && unitIndex > 0 ? unitIndex : 1;
  const unitContent = activeCourse.units[resolvedUnitNum] || activeCourse.units[1];
  const { phrases, grammarTip } = unitContent;

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
