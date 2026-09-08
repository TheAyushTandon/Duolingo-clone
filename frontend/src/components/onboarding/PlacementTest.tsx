import React, { useState, useEffect } from "react";
import { X, Heart, Check, Flame, Moon, Sun, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";
import { getQuestionSvg } from "@/lib/question-assets";
import { DuoMascot } from "@/components/mascot/DuoMascot";
import { useSound } from "@/hooks/useSound";

interface PlacementTestProps {
  courseName?: string;
  courseId?: string;
  onComplete: () => void;
  onClose: () => void;
}

const MOCK_SCORECARD = [
  { q: 'Which one of these is "cat"?', correct: true },
  { q: "Select the matching pairs", correct: true },
  { q: "Write this in English", correct: true },
];

export default function PlacementTest({
  courseName = "French",
  courseId = "fr",
  onComplete,
  onClose,
}: PlacementTestProps) {
  const { playClick, playCorrect, playIncorrect, playHeartLost, playFanfare, speak } = useSound();

  const [testState, setTestState] = useState<
    | "normal"
    | "review_intro"
    | "review"
    | "complete"
    | "score_unlocked"
    | "score_progress"
    | "streak_earned"
    | "streak_commit"
    | "quests_complete"
    | "gems_earned"
  >("normal");

  const [currentQuestion, setCurrentQuestion] = useState(0); // 0, 1, or 2
  const [reviewQueue, setReviewQueue] = useState<number[]>([]);
  const [hearts, setHearts] = useState(5);

  const [showScorecard, setShowScorecard] = useState(false);
  const [streakGoal, setStreakGoal] = useState<number | null>(14);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [matchPairsSelected, setMatchPairsSelected] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [mismatchedPairs, setMismatchedPairs] = useState<string[]>([]);

  // Word Bank (Sentence Builder / Drag & Drop) state for Q3
  const [wordBankSelected, setWordBankSelected] = useState<number[]>([]);

  const { theme, toggleTheme } = useTheme();

  // Determine course-specific question sets
  const isEnglish = courseName?.toLowerCase().includes("english") || courseId?.toLowerCase().includes("en");
  const isSpanish = courseName?.toLowerCase().includes("spanish") || courseId?.toLowerCase().includes("es");
  const isEnglishCourse = isEnglish;
  const isSpanishCourse = isSpanish;

  const q1Config = isEnglish
    ? {
        title: 'Which one of these is "cat"?',
        subtitle: 'Select the English word for "cat"',
        cards: [
          { id: "1", text: "mom", img: "/question_svgs/mom.svg", ttsLang: "en-US" },
          { id: "2", text: "cat", img: "/question_svgs/cat.svg", ttsLang: "en-US" },
          { id: "3", text: "dad", img: "/question_svgs/dad.svg", ttsLang: "en-US" },
        ],
        correctId: "2",
      }
    : isSpanish
    ? {
        title: 'Which one of these is "cat"?',
        subtitle: 'Select the Spanish word for "cat"',
        cards: [
          { id: "1", text: "mamá", img: "/question_svgs/mom.svg", ttsLang: "es-ES" },
          { id: "2", text: "gato", img: "/question_svgs/cat.svg", ttsLang: "es-ES" },
          { id: "3", text: "papá", img: "/question_svgs/dad.svg", ttsLang: "es-ES" },
        ],
        correctId: "2",
      }
    : {
        title: 'Which one of these is "cat"?',
        subtitle: 'Select the French word for "cat"',
        cards: [
          { id: "1", text: "maman", img: "/question_svgs/mom.svg", ttsLang: "fr-FR" },
          { id: "2", text: "chat", img: "/question_svgs/cat.svg", ttsLang: "fr-FR" },
          { id: "3", text: "papa", img: "/question_svgs/dad.svg", ttsLang: "fr-FR" },
        ],
        correctId: "2",
      };

  const q2Left = isEnglish
    ? [
        { id: "en_hello", text: "hello", lang: "en-US" },
        { id: "en_goodbye", text: "goodbye", lang: "en-US" },
        { id: "en_thanks", text: "thank you", lang: "en-US" },
        { id: "en_goodnight", text: "good night", lang: "en-US" },
      ]
    : [
        { id: "en_water", text: "water", lang: "en-US" },
        { id: "en_cat", text: "cat", lang: "en-US" },
        { id: "en_dog", text: "dog", lang: "en-US" },
        { id: "en_car", text: "car", lang: "en-US" },
      ];

  const q2Right = isEnglish
    ? [
        { id: "en_seeyou", text: "see you later", lang: "en-US" },
        { id: "en_hi", text: "hi", lang: "en-US" },
        { id: "en_welcome", text: "you're welcome", lang: "en-US" },
        { id: "en_dreams", text: "sweet dreams", lang: "en-US" },
      ]
    : isSpanish
    ? [
        { id: "es_auto", text: "auto", lang: "es-ES" },
        { id: "es_perro", text: "perro", lang: "es-ES" },
        { id: "es_agua", text: "agua", lang: "es-ES" },
        { id: "es_gato", text: "gato", lang: "es-ES" },
      ]
    : [
        { id: "fr_voiture", text: "voiture", lang: "fr-FR" },
        { id: "fr_chien", text: "chien", lang: "fr-FR" },
        { id: "fr_eau", text: "eau", lang: "fr-FR" },
        { id: "fr_chat", text: "chat", lang: "fr-FR" },
      ];

  const matchesMap: Record<string, string> = isEnglish
    ? {
        en_hello: "en_hi",
        en_hi: "en_hello",
        en_goodbye: "en_seeyou",
        en_seeyou: "en_goodbye",
        en_thanks: "en_welcome",
        en_welcome: "en_thanks",
        en_goodnight: "en_dreams",
        en_dreams: "en_goodnight",
      }
    : isSpanish
    ? {
        en_water: "es_agua",
        es_agua: "en_water",
        en_cat: "es_gato",
        es_gato: "en_cat",
        en_dog: "es_perro",
        es_perro: "en_dog",
        en_car: "es_auto",
        es_auto: "en_car",
      }
    : {
        en_water: "fr_eau",
        fr_eau: "en_water",
        en_cat: "fr_chat",
        fr_chat: "en_cat",
        en_dog: "fr_chien",
        fr_chien: "en_dog",
        en_car: "fr_voiture",
        fr_voiture: "en_car",
      };

  const q3Config = isEnglish
    ? {
        title: "Build this sentence in English",
        bubbleText: "Hello, I would like a coffee and a croissant.",
        spokenText: "Hello, I would like a coffee and a croissant.",
        spokenLang: "en-US",
        wordBankTokens: ["Hello", "I", "would", "like", "a", "coffee", "and", "a", "croissant", "no", "tea", "please"],
        validate: (s: string) =>
          s.toLowerCase().includes("hello") &&
          s.toLowerCase().includes("would like") &&
          s.toLowerCase().includes("coffee") &&
          s.toLowerCase().includes("croissant"),
      }
    : isSpanish
    ? {
        title: "Write this in English",
        bubbleText: "Sí, yo quisiera un café y un croissant.",
        spokenText: "Sí, yo quisiera un café y un croissant.",
        spokenLang: "es-ES",
        wordBankTokens: ["Yes", "I", "would", "like", "a", "coffee", "and", "a", "croissant", "no", "tea", "please"],
        validate: (s: string) =>
          s.toLowerCase().includes("yes") &&
          s.toLowerCase().includes("would like") &&
          s.toLowerCase().includes("coffee") &&
          s.toLowerCase().includes("croissant"),
      }
    : {
        title: "Write this in English",
        bubbleText: "Oui, je voudrais un café et un croissant.",
        spokenText: "Oui, je voudrais un café et un croissant.",
        spokenLang: "fr-FR",
        wordBankTokens: ["Yes", "I", "would", "like", "a", "coffee", "and", "a", "croissant", "no", "tea", "please"],
        validate: (s: string) =>
          s.toLowerCase().includes("yes") &&
          s.toLowerCase().includes("would like") &&
          s.toLowerCase().includes("coffee") &&
          s.toLowerCase().includes("croissant"),
      };

  const wordBankTokens = q3Config.wordBankTokens;

  // Play celebratory sound on complete
  useEffect(() => {
    if (testState === "complete" || testState === "gems_earned") {
      playFanfare();
    }
  }, [testState, playFanfare]);

  const t = {
    bg: theme === "dark" ? "bg-[#131F24]" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-[#4B4B4B]",
    overlayBg: theme === "dark" ? "bg-[#131F24]/95" : "bg-white/95",
    border: theme === "dark" ? "border-[#37464F]" : "border-[#E5E5E5]",
    cardBg: theme === "dark" ? "bg-[#131F24]" : "bg-white",
    cardHover: theme === "dark" ? "hover:bg-[#202F36]" : "hover:bg-[#F7F7F7]",
    cardActiveBg: theme === "dark" ? "bg-[#202F36]" : "bg-[#F7F7F7]",
    textMuted: theme === "dark" ? "text-[#4b5563]" : "text-[#AFAFAF]",
    textMutedHover: theme === "dark" ? "hover:text-[#9ca3af]" : "hover:text-[#777777]",
    progressBg: theme === "dark" ? "bg-[#37464F]" : "bg-[#E5E5E5]",
    footerNormalBg: theme === "dark" ? "bg-[#131F24]" : "bg-white",
    footerCorrectBg: theme === "dark" ? "bg-[#202F36]" : "bg-[#d7ffb8]",
    footerIncorrectBg: theme === "dark" ? "bg-[#FF4B4B]/10" : "bg-[#FFDFDF]",
    btnDisabledBg: theme === "dark" ? "bg-[#37464F]" : "bg-[#E5E5E5]",
    btnDisabledText: theme === "dark" ? "text-[#52656D]" : "text-[#AFAFAF]",
    btnSecondaryBorder: theme === "dark" ? "border-[#37464F]" : "border-[#E5E5E5]",
    btnSecondaryText: theme === "dark" ? "text-[#52656D]" : "text-[#AFAFAF]",
    btnSecondaryHover: theme === "dark" ? "hover:bg-[#202F36]" : "hover:bg-[#F7F7F7]",
    bubbleBg: theme === "dark" ? "bg-[#202F36]" : "bg-white",
    bubbleBorder: theme === "dark" ? "border-[#37464F]" : "border-[#E5E5E5]",
    iconBg: theme === "dark" ? "bg-[#202F36]" : "bg-white",
    scorecardTile: theme === "dark" ? "bg-[#202F36]" : "bg-white",
    scorecardTileBorder: theme === "dark" ? "border-transparent" : "border-[#E5E5E5] border-2",
    subtext: theme === "dark" ? "text-[#afafaf]" : "text-[#777777]",
    streakPanelBg: theme === "dark" ? "bg-[#131F24]" : "bg-white",
    streakDayBg: theme === "dark" ? "bg-[#37464F]" : "bg-[#E5E5E5]",
    streakIconBg: theme === "dark" ? "bg-[#202F36]" : "bg-[#F7F7F7]",
  };

  const qIndex = testState === "review" ? reviewQueue[0] : currentQuestion;

  const handleSelectAnswer = (id: string) => {
    if (isChecking) return;
    playClick();
    const card = q1Config.cards.find((c) => c.id === id);
    if (card) {
      speak(card.text, card.ttsLang);
    }
    setSelectedAnswer(id);
  };

  const handleMatchSelect = (id: string) => {
    if (isChecking) return;
    if (matchPairsSelected.includes(id)) return;

    playClick();
    const item = [...q2Left, ...q2Right].find((i) => i.id === id);
    if (item) {
      speak(item.text, item.lang);
    }

    const newSelected = [...matchPairsSelected, id];
    setMatchPairsSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (matchesMap[first] === second) {
        playCorrect();
        setTimeout(() => {
          setMatchedPairs((prev) => {
            const newMatched = [...prev, first, second];
            if (newMatched.length === 8) {
              setIsCorrect(true);
              setIsChecking(true);
            }
            return newMatched;
          });
          setMatchPairsSelected([]);
        }, 300);
      } else {
        playIncorrect();
        playHeartLost();
        setMismatchedPairs([first, second]);
        setTimeout(() => {
          setHearts((prev) => Math.max(0, prev - 1));
          setMismatchedPairs([]);
          setMatchPairsSelected([]);
        }, 550);
      }
    }
  };

  const handleCheck = () => {
    if (qIndex === 0 && selectedAnswer) {
      setIsChecking(true);
      if (selectedAnswer === q1Config.correctId) {
        setIsCorrect(true);
        playCorrect();
      } else {
        setIsCorrect(false);
        playIncorrect();
        playHeartLost();
      }
    } else if (qIndex === 2 && wordBankSelected.length > 0) {
      setIsChecking(true);
      const builtSentence = wordBankSelected.map((i) => wordBankTokens[i]).join(" ");
      if (q3Config.validate(builtSentence)) {
        setIsCorrect(true);
        playCorrect();
      } else {
        setIsCorrect(false);
        playIncorrect();
        playHeartLost();
      }
    }
  };

  const resetState = () => {
    setIsChecking(false);
    setIsCorrect(null);
    setSelectedAnswer(null);
    setWordBankSelected([]);
  };

  const handleContinue = () => {
    if (testState === "normal") {
      let newQueue = [...reviewQueue];
      if (isCorrect === false) {
        setHearts(prev => Math.max(0, prev - 1));
        newQueue.push(qIndex);
        setReviewQueue(newQueue);
      }
      
      const nextQ = currentQuestion + 1;
      if (nextQ < 3) {
        setCurrentQuestion(nextQ);
        resetState();
      } else {
        if (newQueue.length > 0) {
           setTestState("review_intro");
        } else {
           setTestState("complete");
        }
        resetState();
      }
    } else if (testState === "review") {
      if (isCorrect === false) {
         setHearts(prev => Math.max(0, prev - 1));
         const newQueue = [...reviewQueue];
         const failed = newQueue.shift()!;
         newQueue.push(failed);
         setReviewQueue(newQueue);
      } else {
         const newQueue = [...reviewQueue];
         newQueue.shift();
         setReviewQueue(newQueue);
         if (newQueue.length === 0) {
            setTestState("complete");
         }
      }
      resetState();
    }
  };

  const scorecardItems = [
    { q: q1Config.title, correct: true },
    { q: "Select the matching pairs", correct: true },
    { q: q3Config.title, correct: true },
  ];

  const renderScorecard = () => (
    <div className={`absolute inset-0 z-50 flex flex-col font-din overflow-hidden p-6 backdrop-blur-sm ${t.overlayBg} ${t.text}`}>
      <div className="flex justify-end w-full max-w-5xl mx-auto mb-4">
        <button onClick={() => setShowScorecard(false)} className={`transition-colors p-2 rounded-full border-2 border-transparent ${t.textMuted} ${t.textMutedHover} hover:${t.border}`}>
          <X size={28} strokeWidth={2.5} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto w-full flex justify-center pb-20">
        <div className="max-w-4xl w-full flex flex-col items-center">
           <h2 className="text-3xl font-bold mb-2">Check out your scorecard!</h2>
           <p className={`${t.subtext} text-lg mb-8 font-bold`}>Click the tiles below to reveal the solutions</p>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
             {scorecardItems.map((item, i) => (
                <div key={i} className={`${t.scorecardTile} ${t.scorecardTileBorder} rounded-2xl p-4 flex flex-col justify-between aspect-square`}>
                  <p className={`font-bold text-[15px] sm:text-lg whitespace-pre-wrap ${item.correct ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                    {item.q}
                  </p>
                  <div className="flex justify-end mt-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.correct ? 'bg-[#58CC02]/20 text-[#58CC02]' : 'bg-[#FF4B4B]/20 text-[#FF4B4B]'}`}>
                      {item.correct ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />}
                    </div>
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  if (testState === "streak_commit") {
    return (
      <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center pt-20 max-w-lg mx-auto w-full px-4 overflow-y-auto">
           
           <div className="relative mb-6 flex flex-col items-center">
             <div className={`px-6 py-4 border-2 rounded-2xl text-center mb-6 relative ${t.bubbleBg} ${t.bubbleBorder}`}>
               <span className={`text-lg font-bold ${t.text}`}>
                 You&apos;ll be{" "}
                 <span className="text-[#FF9600]">
                   {streakGoal === 7
                     ? "3x more"
                     : streakGoal === 14
                     ? "4.2x more"
                     : streakGoal === 30
                     ? "6x more"
                     : streakGoal === 50
                     ? "9.5x more"
                     : "4.2x more"}
                 </span>{" "}
                 likely to complete the course!
               </span>
               <div className={`absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-r-[8px] border-r-transparent ${theme === "dark" ? "border-t-[#37464F]" : "border-t-[#E5E5E5]"}`}></div>
               <div className={`absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-r-[6px] border-r-transparent z-10 ${theme === "dark" ? "border-t-[#202F36]" : "border-t-white"}`}></div>
             </div>
             
             <div className={`w-32 h-32 rounded-3xl flex items-center justify-center border-4 mb-6 shadow-xl ${t.streakIconBg} ${t.border}`}>
                <Flame size={64} fill="#FF9600" className="text-[#FF9600]" />
             </div>
           </div>

           <div className="w-full flex flex-col gap-3 pb-8">
             {[
               { days: 7, label: "Good" },
               { days: 14, label: "Great" },
               { days: 30, label: "Incredible" },
               { days: 50, label: "Unstoppable" },
             ].map((opt) => (
               <button 
                 key={opt.days}
                 onClick={() => setStreakGoal(opt.days)}
                 className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all ${
                   streakGoal === opt.days 
                     ? 'border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]' 
                     : `${t.border} ${t.cardHover} ${t.text}`
                 }`}
               >
                 <span className="font-bold text-lg">{opt.days} day streak</span>
                 <span className={`font-bold ${streakGoal === opt.days ? 'text-[#1CB0F6]' : t.textMuted}`}>
                   {opt.label}
                 </span>
               </button>
             ))}
           </div>

         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex">
             <button onClick={() => setTestState("quests_complete")} className="w-full sm:w-auto ml-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#1CB0F6] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#1899D6] active:shadow-none">
               I CAN DO IT!
             </button>
           </div>
         </div>
      </div>
    );
  }

  if (testState === "streak_earned") {
    return (
      <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center pt-10 max-w-lg mx-auto w-full px-4">
           <div className="w-32 h-32 mb-6 animate-bounce">
             <svg viewBox="0 0 24 24" fill="#FF9600" className="w-full h-full"><path d="M12 2c0 0-4.5 3-4.5 7.5S10 16 12 16s4.5-2.5 4.5-6.5S12 2 12 2z"/></svg>
           </div>
           
           <h1 className="text-7xl font-black text-[#FF9600] mb-2">1</h1>
           <h2 className="text-2xl font-bold text-[#FF9600] mb-10">day streak</h2>
           
           <div className={`w-full border-2 rounded-2xl p-6 shadow-lg ${t.streakPanelBg} ${t.border}`}>
              <div className="flex justify-between mb-4 px-2">
                {['M', 'Tu', 'W', 'Th', 'F'].map((d, i) => (
                   <div key={d} className="flex flex-col items-center gap-2">
                     <span className={`text-sm font-bold ${i === 0 ? 'text-[#FF9600]' : t.textMuted}`}>{d}</span>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-[#FF9600] text-white' : t.streakDayBg}`}>
                       {i === 0 && <Check size={20} strokeWidth={4} />}
                     </div>
                   </div>
                ))}
              </div>
              <div className={`border-t-2 pt-4 mt-2 ${t.border}`}>
                <p className={`text-center text-sm font-bold leading-relaxed ${t.text}`}>
                  Practicing daily grows your streak, but skipping a day resets it!
                </p>
              </div>
           </div>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex justify-between items-center gap-4">
             <button onClick={() => setShowScorecard(true)} className={`hidden sm:block px-6 py-3 rounded-2xl border-2 font-bold uppercase tracking-wide transition-colors ${t.btnSecondaryBorder} ${t.btnSecondaryText} ${t.btnSecondaryHover}`}>
               Review Lesson
             </button>
             <button onClick={() => setTestState("streak_commit")} className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#1CB0F6] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#1899D6] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
      </div>
    );
  }

  if (testState === "score_progress") {
    const flagSrc = isSpanishCourse
      ? "/assets/flags/spanish.svg"
      : isEnglishCourse
      ? "/assets/flags/english.svg"
      : "/assets/flags/french.svg";
    return (
      <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center pt-10 max-w-2xl mx-auto w-full px-8">
           <div className="flex items-center gap-4 mb-16">
             <img src={flagSrc} className="w-16 h-12 rounded shadow-sm object-cover border-2 border-white/20" />
             <span className="text-6xl font-black">1</span>
           </div>
           
           <div className="w-full flex items-center gap-4 mb-12">
             <span className={`text-xl font-bold ${t.text}`}>1</span>
             <div className={`flex-1 h-4 rounded-full overflow-hidden ${t.progressBg}`}>
               <motion.div 
                 initial={{ width: "10%" }} 
                 animate={{ width: "25%" }} 
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="h-full bg-[#58CC02] rounded-full" 
               />
             </div>
             <span className={`text-xl font-bold ${t.text}`}>2</span>
           </div>
           
           <h2 className="text-2xl font-bold text-center">Your Score connects course progress to real-life skills</h2>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex">
             <button onClick={() => setTestState("streak_earned")} className="w-full sm:w-auto ml-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#1CB0F6] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#1899D6] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
      </div>
    );
  }

   if (testState === "score_unlocked") {
    const flagSrc = isSpanishCourse
      ? "/assets/flags/spanish.svg"
      : isEnglishCourse
      ? "/assets/flags/english.svg"
      : "/assets/flags/french.svg";
    const languageTitle = isSpanishCourse ? "Spanish" : isEnglishCourse ? "English" : "French";

    return (
      <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center pt-10">
           <video src="/question_videos/canvas-animation-1788793703936.webm" autoPlay loop muted className="w-48 h-48 object-contain mb-8" />
           <div className="flex items-center gap-4 mb-8">
             <img src={flagSrc} alt={languageTitle} className="w-16 h-12 rounded shadow-sm object-cover border-2 border-white/20" />
             <span className="text-6xl font-black">1</span>
           </div>
           <h2 className="text-2xl font-bold text-center">You unlocked your Duolingo {languageTitle} Score!</h2>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex">
             <button onClick={() => setTestState("score_progress")} className="w-full sm:w-auto ml-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#1CB0F6] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#1899D6] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
      </div>
    );
  }

  if (testState === "review_intro") {
     return (
       <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         <div className="flex-1 flex flex-col items-center justify-end pb-20">
            <div className="relative mb-8 flex items-center justify-center w-full">
              <DuoMascot mood="thinking" size={130} className="z-10" />
              <div className={`absolute left-[60%] top-1/3 px-4 py-3 border-2 rounded-2xl whitespace-nowrap font-bold z-20 shadow-lg ${t.bubbleBg} ${t.bubbleBorder} ${t.text}`}>
                <div className={`absolute top-1/2 -translate-y-1/2 -left-[9px] w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-b-[8px] border-b-transparent ${theme === "dark" ? "border-r-[#37464F]" : "border-r-[#E5E5E5]"}`}></div>
                <div className={`absolute top-1/2 -translate-y-1/2 -left-[6px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-b-[6px] border-b-transparent ${theme === "dark" ? "border-r-[#202F36]" : "border-r-white"}`}></div>
                Let's review the exercise you missed!
              </div>
            </div>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex">
             <button onClick={() => { setTestState("review"); resetState(); }} className="w-full sm:w-auto ml-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#58CC02] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#46A302] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
       </div>
     );
  }

  if (testState === "complete") {
     return (
       <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-40 h-40 flex items-center justify-center mb-6">
              <DuoMascot mood="celebrate" size={140} className="w-full h-full" />
            </div>
            <h2 className="text-[#58CC02] text-3xl sm:text-4xl font-black mb-6">Lesson Complete!</h2>
            <div className="flex gap-4">
              <div className={`border-2 border-[#FFC800] rounded-2xl overflow-hidden w-32 flex flex-col items-center ${t.cardBg}`}>
                <div className="bg-[#FFC800] text-[#131F24] font-black w-full text-center py-1 text-xs tracking-widest">TOTAL XP</div>
                <div className="flex items-center gap-2 py-4 font-bold text-xl text-[#FFC800]">
                   <svg className="w-5 h-5 fill-[#FFC800]" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                   13
                </div>
              </div>
              <div className={`border-2 border-[#58CC02] rounded-2xl overflow-hidden w-32 flex flex-col items-center ${t.cardBg}`}>
                <div className="bg-[#58CC02] text-[#131F24] font-black w-full text-center py-1 text-xs tracking-widest">GREAT!</div>
                <div className="flex items-center gap-2 py-4 font-bold text-xl text-[#58CC02]">
                   <svg className="w-5 h-5 text-[#58CC02]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                   92%
                </div>
              </div>
            </div>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex justify-between items-center gap-4">
             <button onClick={() => setShowScorecard(true)} className={`hidden sm:block px-6 py-3 rounded-2xl border-2 font-bold uppercase tracking-wide transition-colors ${t.btnSecondaryBorder} ${t.btnSecondaryText} ${t.btnSecondaryHover}`}>
               Review Lesson
             </button>
             <button onClick={() => setTestState("score_unlocked")} className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#58CC02] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#46A302] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
       </div>
     );
  }

  if (testState === "quests_complete") {
     return (
       <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center pt-10 max-w-lg mx-auto w-full px-4">
            <h2 className="text-[#FFC800] text-3xl font-bold mb-8 text-center">All Daily Quests complete!</h2>
            <div className={`w-full max-w-md border-2 rounded-2xl p-6 shadow-lg flex flex-col gap-4 ${t.streakPanelBg} ${t.border}`}>
               <div className="flex items-center gap-4">
                 <div className="w-10 h-12 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 24 24" fill="#FFC800" className="w-10 h-10 drop-shadow-md">
                       <path d="M12 2L9 8l-6 1 4.5 4.5L6 20l6-3 6 3-1.5-6.5L21 9l-6-1z"/>
                    </svg>
                 </div>
                 <div className="flex-1 flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold">Earn 10 XP</span>
                   </div>
                   <div className="relative w-full h-4 rounded-full bg-[#E5E5E5] overflow-visible">
                     <div className="absolute top-0 left-0 h-full rounded-full bg-[#FFC800] w-full" />
                     <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-black text-[#E5A400] z-10">
                       10 / 10
                     </div>
                     <div className="absolute -right-2 -top-2 w-8 h-8">
                        <img src="/quests.svg" className="w-full h-full object-contain drop-shadow" alt="chest" />
                     </div>
                   </div>
                 </div>
               </div>
            </div>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex justify-between items-center gap-4">
             <button onClick={() => setShowScorecard(true)} className={`hidden sm:block px-6 py-3 rounded-2xl border-2 font-bold uppercase tracking-wide transition-colors ${t.btnSecondaryBorder} ${t.btnSecondaryText} ${t.btnSecondaryHover}`}>
               Review Lesson
             </button>
             <button onClick={() => setTestState("gems_earned")} className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#58CC02] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#46A302] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
       </div>
     );
  }

  if (testState === "gems_earned") {
     return (
       <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
         {showScorecard && renderScorecard()}
         <div className="flex-1 flex flex-col items-center justify-center pt-10 max-w-lg mx-auto w-full px-4 text-center">
            <div className="w-40 h-40 mb-6">
               <img src="/shop.svg" className="w-full h-full object-contain" alt="Gems Chest" />
            </div>
            <h2 className="text-3xl font-bold mb-4">You earned 5 gems!</h2>
            <p className={`text-lg font-bold ${t.textMuted}`}>Nice job reaching your daily goal!</p>
         </div>
         <div className={`border-t-2 p-4 sm:px-8 sm:py-6 ${t.footerNormalBg} ${t.border}`}>
           <div className="max-w-[1000px] mx-auto flex justify-between items-center gap-4">
             <button onClick={() => setShowScorecard(true)} className={`hidden sm:block px-6 py-3 rounded-2xl border-2 font-bold uppercase tracking-wide transition-colors ${t.btnSecondaryBorder} ${t.btnSecondaryText} ${t.btnSecondaryHover}`}>
               Review Lesson
             </button>
             <button onClick={onComplete} className="w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all bg-[#58CC02] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#46A302] active:shadow-none">
               Continue
             </button>
           </div>
         </div>
       </div>
     );
  }

  // Progress logic
  let progressWidth = "10%";
  if (testState === "normal") {
    progressWidth = currentQuestion === 0 ? "15%" : currentQuestion === 1 ? "45%" : "75%";
  } else if (testState === "review") {
    progressWidth = "90%";
  }

  return (
    <div className={`fixed inset-0 flex flex-col font-din z-40 overflow-hidden ${t.bg} ${t.text}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 md:py-8 max-w-4xl mx-auto w-full">
        <button onClick={onClose} className={`transition-colors p-2 ${t.textMuted} ${t.textMutedHover}`}>
          <X size={28} strokeWidth={2.5} />
        </button>
        
        <div className="flex-1 mx-4 sm:mx-8">
          <div className={`h-4 w-full rounded-full overflow-hidden ${t.progressBg}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                testState === "review" ? 'bg-[#FF4B4B]' : qIndex === 1 ? 'bg-[#FFC800]' : 'bg-[#58CC02]'
              }`}
              style={{ width: progressWidth }}
            />
          </div>
          {testState === "review" && (
            <div className="text-center mt-2 text-[#FF4B4B] font-bold text-sm tracking-widest uppercase">
              Review
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-[#FFC800] hover:bg-[#FFC800]/10' : 'text-[#AFAFAF] hover:bg-[#E5E5E5]'}`}>
            {theme === 'dark' ? <Sun size={24} strokeWidth={2.5} /> : <Moon size={24} strokeWidth={2.5} />}
          </button>
          <div className="flex items-center gap-2 text-[#FF4B4B] font-bold text-lg">
            <Heart fill="#FF4B4B" size={24} />
            <span>{hearts}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col items-center px-4">
        <div className="w-full max-w-[600px] flex-1 flex flex-col pt-4 pb-20">
          <AnimatePresence mode="wait">
            {qIndex === 0 ? (
              <motion.div
                key="q1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col w-full"
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[#CE82FF] font-black text-sm tracking-widest uppercase border-2 border-[#CE82FF] rounded-lg px-2 py-1">
                    New Word
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">
                  {q1Config.title}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {q1Config.cards.map((card) => {
                     const isSelected = selectedAnswer === card.id;
                     const disabled = isChecking;
                     let cardClass = `${t.border} ${t.cardBg} ${t.cardHover}`;
                     let textClass = t.text;
                     let numBorder = `${t.border} ${t.textMuted}`;

                     if (isSelected) {
                        if (!isChecking) {
                           cardClass = "border-[#1CB0F6] bg-[#1CB0F6]/10";
                           textClass = "text-[#1CB0F6]";
                           numBorder = "border-[#1CB0F6] text-[#1CB0F6]";
                        } else if (isCorrect === true) {
                           cardClass = "border-[#58CC02] bg-[#58CC02]/10";
                           textClass = "text-[#58CC02]";
                           numBorder = "border-[#58CC02] text-[#58CC02]";
                        } else if (isCorrect === false) {
                           cardClass = "border-[#FF4B4B] bg-[#FF4B4B]/10";
                           textClass = "text-[#FF4B4B]";
                           numBorder = "border-[#FF4B4B] text-[#FF4B4B]";
                        }
                     } else if (isChecking && isCorrect === false && card.id === q1Config.correctId) {
                        cardClass = "border-[#58CC02] bg-[#58CC02]/10";
                        textClass = "text-[#58CC02]";
                        numBorder = "border-[#58CC02] text-[#58CC02]";
                     }

                     return (
                       <button
                         key={card.id}
                         onClick={() => handleSelectAnswer(card.id)}
                         disabled={disabled}
                         className={`flex flex-col items-center justify-between p-4 border-2 rounded-2xl transition-all h-[180px] ${cardClass}`}
                       >
                         <div className="flex-1 flex items-center justify-center">
                           <img src={card.img} alt={card.text} className="h-24 object-contain" />
                         </div>
                         <div className="flex items-center w-full mt-2">
                           <span className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold shrink-0 ${numBorder}`}>
                             {card.id}
                           </span>
                           <span className={`flex-1 text-center font-bold text-lg ${textClass}`}>
                             {card.text}
                           </span>
                         </div>
                       </button>
                     );
                  })}
                </div>
              </motion.div>
            ) : qIndex === 1 ? (
              <motion.div
                key="q2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col w-full"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">
                  Select the matching pairs
                </h2>
                <div className="flex justify-between gap-4">
                  {/* Left Column */}
                  <div className="flex flex-col gap-3 flex-1">
                    {q2Left.map((item) => {
                       const isSelected = matchPairsSelected.includes(item.id);
                       const isMatched = matchedPairs.includes(item.id);
                       const isMismatched = mismatchedPairs.includes(item.id);
                       return (
                         <button
                           key={item.id}
                           onClick={() => handleMatchSelect(item.id)}
                           disabled={isMatched || isChecking}
                           className={`p-4 border-2 rounded-2xl transition-all text-center font-bold text-lg
                             ${isMatched ? `${t.border} ${t.textMuted} opacity-50 cursor-not-allowed bg-transparent` :
                               isMismatched ? "border-[#FF4B4B] bg-[#FF4B4B]/20 text-[#FF4B4B] animate-shake" :
                               isSelected ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]" :
                               `${t.border} ${t.cardBg} ${t.cardHover} ${t.text}`}
                           `}
                         >
                           {item.text}
                         </button>
                       );
                    })}
                  </div>
                  
                  {/* Right Column */}
                  <div className="flex flex-col gap-3 flex-1">
                    {q2Right.map((item) => {
                       const isSelected = matchPairsSelected.includes(item.id);
                       const isMatched = matchedPairs.includes(item.id);
                       const isMismatched = mismatchedPairs.includes(item.id);
                       return (
                         <button
                           key={item.id}
                           onClick={() => handleMatchSelect(item.id)}
                           disabled={isMatched || isChecking}
                           className={`p-4 border-2 rounded-2xl transition-all text-center font-bold text-lg
                             ${isMatched ? `${t.border} ${t.textMuted} opacity-50 cursor-not-allowed bg-transparent` :
                               isMismatched ? "border-[#FF4B4B] bg-[#FF4B4B]/20 text-[#FF4B4B] animate-shake" :
                               isSelected ? "border-[#1CB0F6] bg-[#1CB0F6]/10 text-[#1CB0F6]" :
                               `${t.border} ${t.cardBg} ${t.cardHover} ${t.text}`}
                           `}
                         >
                           {item.text}
                         </button>
                       );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="q3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col w-full"
              >
                <h2 className="text-2xl sm:text-3xl font-bold mb-8">
                  {q3Config.title}
                </h2>

                {/* Character Speaker & Sentence */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                    <img src={getQuestionSvg("placement-test-q3")} alt="speaker" className="w-full h-full object-contain" />
                  </div>
                  <div className={`relative px-5 py-3.5 border-2 rounded-2xl flex items-center gap-3 ${t.bubbleBg} ${t.bubbleBorder}`}>
                    <div className={`absolute left-[-9px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-b-[8px] border-b-transparent ${theme === "dark" ? "border-r-[#37464F]" : "border-r-[#E5E5E5]"}`} />
                    <div className={`absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-b-[6px] border-b-transparent ${theme === "dark" ? "border-r-[#202F36]" : "border-r-white"}`} />
                    <button 
                      onClick={() => {
                        playClick();
                        speak(q3Config.spokenText, q3Config.spokenLang);
                      }}
                      className="p-2 rounded-xl bg-[#1CB0F6] text-white hover:brightness-105 shadow-sm transition-transform active:scale-95"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2.5-1.23l-5 5H2v10h4.5l5 5V2z"/></svg>
                    </button>
                    <span 
                      onClick={() => {
                        speak(q3Config.spokenText, q3Config.spokenLang);
                      }}
                      className={`text-base sm:text-lg font-bold underline decoration-dotted decoration-[var(--text-sub)] cursor-pointer ${t.text}`}
                    >
                      {q3Config.bubbleText}
                    </span>
                  </div>
                </div>

                {/* Answer Tray / Lines */}
                <div className={`min-h-[110px] border-t-2 border-b-2 py-3 flex flex-wrap items-center gap-2 mb-8 ${t.border}`}>
                  {wordBankSelected.map((idx) => {
                    const word = wordBankTokens[idx];
                    return (
                      <button
                        key={`selected-${idx}`}
                        onClick={() => {
                          if (!isChecking) {
                            playClick();
                            setWordBankSelected(prev => prev.filter(i => i !== idx));
                          }
                        }}
                        disabled={isChecking}
                        className={`px-4 py-2.5 rounded-2xl border-2 border-b-4 font-bold text-base shadow-sm active:translate-y-0.5 transition-all
                          ${t.cardBg} ${t.border} ${t.text} hover:border-[#1CB0F6]
                        `}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                {/* Word Bank Pool */}
                <div className="flex flex-wrap justify-center gap-2.5">
                  {wordBankTokens.map((word, idx) => {
                    const isSelected = wordBankSelected.includes(idx);
                    return (
                      <div key={`pool-token-${idx}`} className="relative">
                        {/* Empty slot placeholder */}
                        <div className={`px-4 py-2.5 rounded-2xl border-2 font-bold text-base invisible`}>
                          {word}
                        </div>
                        {!isSelected ? (
                          <button
                            onClick={() => {
                              if (!isChecking) {
                                playClick();
                                speak(word, isEnglishCourse ? "en-US" : isSpanishCourse ? "es-ES" : "fr-FR");
                                setWordBankSelected(prev => [...prev, idx]);
                              }
                            }}
                            disabled={isChecking}
                            className={`absolute inset-0 px-4 py-2.5 rounded-2xl border-2 border-b-4 font-bold text-base shadow-sm active:border-b-2 hover:bg-[#1CB0F6]/10 hover:border-[#1CB0F6] transition-all flex items-center justify-center
                              ${t.cardBg} ${t.border} ${t.text}
                            `}
                          >
                            {word}
                          </button>
                        ) : (
                          <div className={`absolute inset-0 rounded-2xl bg-[var(--border-color)]/60 border-2 border-[var(--border-color)]`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Footer */}
      <div className={`border-t-2 p-4 sm:px-8 sm:py-6 transition-colors duration-300 ${
        isChecking 
          ? isCorrect ? `${t.footerCorrectBg} border-transparent` : `${t.footerIncorrectBg} border-transparent`
          : `${t.footerNormalBg} ${t.border}`
      }`}>
        <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Footer Left Section */}
          <div className="flex-1 w-full sm:w-auto">
            {isChecking && isCorrect === true ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#58CC02] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[#58CC02] text-2xl font-bold mb-1">Good job!</h3>
                  <div className="flex gap-4 text-sm font-bold text-[#58CC02]/80 uppercase tracking-wider">
                     <button className="hover:text-[#58CC02]">FLAG</button>
                     <button className="hover:text-[#58CC02]">REPORT</button>
                  </div>
                </div>
              </div>
            ) : isChecking && isCorrect === false ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#E5E5E5]">
                  <div className="w-10 h-10 rounded-full bg-[#FF4B4B] flex items-center justify-center">
                    <X className="w-6 h-6 text-white" strokeWidth={4} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[#FF4B4B] text-2xl font-bold mb-1">Correct answer:</h3>
                  <div className="text-[#FF4B4B] font-bold text-lg">
                    {qIndex === 0 
                      ? (q1Config.cards.find(c => c.id === q1Config.correctId)?.text || "") 
                      : qIndex === 2 
                      ? (isEnglishCourse 
                          ? "Oui, je voudrais un café et un croissant." 
                          : isSpanishCourse 
                          ? "Yes, I would like a coffee and a croissant." 
                          : "Yes, I would like a coffee and a croissant.") 
                      : "..."}
                  </div>
                </div>
              </div>
            ) : (
              <button
                className={`hidden sm:block px-6 py-3 rounded-2xl border-2 font-bold uppercase tracking-wide transition-colors ${t.btnSecondaryBorder} ${t.btnSecondaryText} ${t.btnSecondaryHover}`}
                disabled={isChecking}
              >
                Skip
              </button>
            )}
          </div>

          {/* Footer Right Section */}
          <div className="w-full sm:w-auto">
            {isChecking ? (
              <button
                onClick={handleContinue}
                className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all text-white hover:brightness-105 active:translate-y-1 active:shadow-none
                  ${isCorrect ? "bg-[#58CC02] shadow-[0_4px_0_#46A302]" : "bg-[#FF4B4B] shadow-[0_4px_0_#EA2B2B]"}
                `}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={
                  (qIndex === 0 && !selectedAnswer) ||
                  (qIndex === 2 && wordBankSelected.length === 0) ||
                  qIndex === 1
                }
                className={`w-full sm:w-auto px-10 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[15px] transition-all
                  ${((selectedAnswer && qIndex === 0) || (wordBankSelected.length > 0 && qIndex === 2))
                    ? "bg-[#58CC02] text-white hover:brightness-105 active:translate-y-1 shadow-[0_4px_0_#46A302] active:shadow-none"
                    : `${t.btnDisabledBg} ${t.btnDisabledText} cursor-not-allowed`
                  }
                `}
              >
                Check
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
