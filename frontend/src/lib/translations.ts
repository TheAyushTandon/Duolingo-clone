/**
 * Multi-language translation dictionary and prompt translation utilities.
 * Supports English ('en') and Hindi ('hi').
 */

export type LanguageCode = "en" | "hi";

export const HINDI_TRANSLATIONS: Record<string, string> = {
  // Navigation & Shell
  "Learn": "सीखें",
  "Leaderboard": "लीडरबोर्ड",
  "Leaderboards": "लीडरबोर्ड",
  "Quests": "मिशन",
  "Shop": "दुकान",
  "Profile": "प्रोफ़ाइल",
  "Settings": "सेटिंग्स",
  "More": "अधिक",
  "Log out": "लॉग आउट",
  "LOGOUT": "लॉग आउट",
  "Sign in": "साइन इन करें",
  "Get Started": "शुरू करें",
  "GET STARTED": "शुरू करें",
  "I ALREADY HAVE AN ACCOUNT": "मेरे पास पहले से खाता है",
  "I already have an account": "मेरे पास पहले से खाता है",
  "CONTINUE": "आगे बढ़ें",
  "Continue": "आगे बढ़ें",
  "CHECK": "जांचें",
  "Check": "जांचें",
  "SKIP": "छोड़ें",
  "Skip": "छोड़ें",

  // Header
  "SITE LANGUAGE": "साइट भाषा",
  "SITE LANGUAGE: ENGLISH": "साइट भाषा: अंग्रेज़ी",
  "SITE LANGUAGE: HINDI": "साइट भाषा: हिंदी",

  // Landing Page Hero
  "The most fun way to learn languages, chess, and more!": "भाषाएं, शतरंज और बहुत कुछ सीखने का सबसे मज़ेदार तरीका!",
  
  // Feature Showcase
  "free. fun. effective.": "मुफ़्त। मज़ेदार। असरदार।",
  "Free. Fun. Effective.": "मुफ़्त। मज़ेदार। असरदार।",
  "Learning with Duolingo is fun, and research shows that it works! With quick, bite-sized lessons, you'll earn points and unlock new levels while gaining real-world communication skills.":
    "डुओलिंगो के साथ सीखना मज़ेदार है और शोध बताते हैं कि यह कारगर है! छोटे-छोटे पाठों के साथ पॉइंट्स कमाएं और नए स्तर अनलॉक करें।",
  "research shows that it works": "शोध बताते हैं कि यह कारगर है",
  "backed by science": "विज्ञान द्वारा प्रमाणित",
  "Backed by science": "विज्ञान द्वारा प्रमाणित",
  "We use a combination of research-backed teaching methods and delightful content to create courses that effectively teach reading, writing, listening, and speaking skills!":
    "हम शोध-समर्थित शिक्षण पद्धतियों और बेहतरीन सामग्री का उपयोग करते हैं जो पढ़ना, लिखना, सुनना और बोलना सिखाती हैं!",
  "stay motivated": "प्रेरित रहें",
  "Stay motivated": "प्रेरित रहें",
  "We make it easy to form a habit of language learning with game-like features, fun challenges, and reminders from our friendly mascot, Duo the owl.":
    "गेम जैसी सुविधाओं, मज़ेदार चुनौतियों और हमारे प्यारे शुभंकर डुओ उल्लू के रिमाइंडर्स के साथ भाषा सीखने की आदत बनाना आसान है।",
  "personalized learning": "व्यक्तिगत शिक्षा",
  "Personalized learning": "व्यक्तिगत शिक्षा",
  "Combining the best of AI and language science, lessons are tailored to help you learn at just the right level and pace.":
    "एआई और भाषा विज्ञान के बेहतरीन तालमेल से पाठ आपकी गति और स्तर के अनुसार तैयार किए जाते हैं।",

  // Super Duolingo & DET
  "Supercharge your learning": "अपनी शिक्षा को सुपरचार्ज करें",
  "Learn faster with Super Duolingo, featuring unlimited hearts, personalized practice, and no ads.":
    "सुपर डुओलिंगो के साथ असीमित दिल, व्यक्तिगत अभ्यास और बिना विज्ञापन के तेज़ी से सीखें।",
  "TRY SUPER FOR FREE": "मुफ़्त में सुपर आज़माएं",
  "TRY 1 WEEK FREE": "1 हफ़्ता मुफ़्त आज़माएं",
  "duolingo english test": "डुओलिंगो अंग्रेज़ी परीक्षा",
  "Our convenient, fast, and affordable English test integrates the latest assessment science and AI — empowering anyone to accurately test their English where and when they’re at their best.":
    "हमारी सुविधाजनक, तेज़ और किफ़ायती अंग्रेज़ी परीक्षा आधुनिक मूल्यांकन विज्ञान और एआई से युक्त है — जो किसी को भी कभी भी अपनी अंग्रेज़ी परखने की सुविधा देती है।",
  "CERTIFY YOUR ENGLISH": "अपनी अंग्रेज़ी प्रमाणित करें",
  "Convenient, fast, and affordable English testing.": "सुविधाजनक, तेज़ और किफ़ायती अंग्रेज़ी परीक्षा।",
  "Acceptable at thousands of universities worldwide.": "दुनिया भर के हज़ारों विश्वविद्यालयों में मान्य।",
  "TAKE THE TEST": "परीक्षा दें",
  "learn anytime, anywhere": "कभी भी, कहीं भी सीखें",
  "Learn anytime, anywhere": "कभी भी, कहीं भी सीखें",
  "learn anytime,": "कभी भी,",
  "Learn a language with Duolingo.": "डुओलिंगो के साथ भाषा सीखें।",
  "GOT IT": "समझ गया",
  "Got it": "समझ गया",
  "Accuracy": "सटीकता",
  "ACCURACY": "सटीकता",

  // Lesson Player Prompts
  "Tap the matching pairs": "मिलान वाले जोड़ों पर टैप करें",
  "Select the correct meaning": "सही अर्थ चुनें",
  "Write this in English": "इसे अंग्रेज़ी में लिखें",
  "Write this in French": "इसे फ़्रेंच में लिखें",
  "Write this in Spanish": "इसे स्पैनिश में लिखें",
  "Tap what you hear": "जो आप सुनते हैं उस पर टैप करें",
  "Type what you hear": "जो आप सुनते हैं उसे टाइप करें",
  "Fill in the blank": "खाली स्थान भरें",
  "Translate this sentence": "इस वाक्य का अनुवाद करें",
  "Translate into French": "फ़्रेंच में अनुवाद करें",
  "Translate into English": "अंग्रेज़ी में अनुवाद करें",
  "Translate into Spanish": "स्पैनिश में अनुवाद करें",
  "Complete the sentence": "वाक्य पूरा करें",

  // Feedback Bar
  "Nicely done!": "बहुत बढ़िया!",
  "Correct!": "बिल्कुल सही!",
  "Great job!": "शाबाश!",
  "Awesome!": "कमाल का!",
  "Incorrect": "गलत उत्तर",
  "Correct solution:": "सही समाधान:",

  // Lesson Completion & Modals
  "Lesson Complete!": "पाठ पूरा हुआ!",
  "Total XP": "कुल XP",
  "Streak": "लगातार दिन",
  "Gems": "रत्न",
  "Amazing progress! Keep the flame alive!": "शानदार प्रगति! अपनी लकीर को जारी रखें!",
  "Wait, don't leave yet!": "रुकिए, अभी मत जाइए!",
  "You'll lose your progress if you quit now.": "यदि आप अभी छोड़ते हैं तो इस पाठ की प्रगति मिट जाएगी।",
  "KEEP LEARNING": "सीखते रहें",
  "END SESSION": "सत्र समाप्त करें",
  "Out of Hearts!": "दिल खत्म हो गए!",
  "You ran out of hearts!": "आपके दिल खत्म हो गए!",
  "Keep your streak going by refilling your hearts or completing a quick review session.":
    "अपने दिल दोबारा भरकर या अभ्यास सत्र पूरा करके अपनी लकीर बनाए रखें।",
  "Refill your hearts to keep practicing, or wait for them to regenerate.":
    "अभ्यास जारी रखने के लिए अपने दिल फिर से भरें, या उनके दोबारा भरने की प्रतीक्षा करें।",
  "Refill Hearts": "दिल दोबारा भरें",
  "Refill All 5 Hearts": "सभी 5 दिल दोबारा भरें",
  "Practice to Earn 1 Heart (+1 ❤️)": "1 दिल कमाने के लिए अभ्यास करें (+1 ❤️)",
  "QUIT TO LEARNING PATH": "सीखने के पथ पर वापस जाएं",

  // Onboarding Wizard
  "I want to learn...": "मैं सीखना चाहता हूँ...",
  "Why are you learning a language?": "आप भाषा क्यों सीख रहे हैं?",
  "Choose a daily goal": "दैनिक लक्ष्य चुनें",
  "Casual": "सामान्य",
  "Regular": "नियमित",
  "Serious": "गंभीर",
  "Intense": "सघन",
  "min / day": "मिनट / दिन",
  "Setting up...": "तैयार किया जा रहा है...",

  // Landing Footer & Badges
  "learn a language": "भाषा सीखें",
  "with duolingo": "डुओलिंगो के साथ",
  "learn a language with duolingo": "डुओलिंगो के साथ भाषा सीखें",
  "About us": "हमारे बारे में",
  "Products": "उत्पाद",
  "Apps": "ऐप्स",
  "Help & Support": "सहायता और सहायता",
  "Terms & Privacy": "नियम और गोपनीयता",
  "Site language:": "साइट भाषा:",
  "Download on the": "डाउनलोड करें",
  "Get it on": "डाउनलोड करें",
  "App Store": "App Store",
  "Google Play": "Google Play",

  // Feedback Bar & Tips
  "Tip: Press Enter ↵ to submit": "सुझाव: सबमिट करने के लिए Enter ↵ दबाएं",
  "You got it right. Keep going!": "बिल्कुल सही जवाब। आगे बढ़ते रहें!",
  "Please review the correct answer": "कृपया सही उत्तर देखें",
  "CHECKING...": "जांचा जा रहा है...",
  "Checking...": "जांचा जा रहा है...",
  "Achievement Unlocked!": "उपलब्धि अनलॉक हुई!",
  "You are making fantastic language progress!": "आप भाषा में शानदार प्रगति कर रहे हैं!",
  "TOTAL XP": "कुल XP",
  "STREAK": "लगातार दिन",

  // Notices
  "Only English and Hindi are available in this section.": "इस अनुभाग में केवल अंग्रेज़ी और हिंदी उपलब्ध हैं।",
  "Only languages are supported as of this version of Duolingo.": "डुओलिंगो के इस संस्करण में केवल भाषाएं समर्थित हैं।",
};

/**
 * Translates a given static key or phrase into the target language.
 */
export function translateText(key: string, lang: LanguageCode = "en"): string {
  if (lang === "en" || !key) return key;
  return HINDI_TRANSLATIONS[key] || HINDI_TRANSLATIONS[key.trim()] || key;
}

/**
 * Translates dynamic lesson/exercise prompts into Hindi with fallback to original prompt.
 */
export function translatePrompt(prompt: string, lang: LanguageCode = "en"): string {
  if (lang === "en" || !prompt) return prompt;
  const trimmed = prompt.trim();
  if (HINDI_TRANSLATIONS[trimmed]) return HINDI_TRANSLATIONS[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(HINDI_TRANSLATIONS)) {
    if (k.toLowerCase() === lower) return v;
  }

  // Common pattern matches
  if (/^tap the matching pairs/i.test(trimmed)) return "मिलान वाले जोड़ों पर टैप करें";
  if (/^select the correct meaning/i.test(trimmed)) return "सही अर्थ चुनें";
  if (/^tap what you hear/i.test(trimmed)) return "जो आप सुनते हैं उस पर टैप करें";
  if (/^type what you hear/i.test(trimmed)) return "जो आप सुनते हैं उसे टाइप करें";
  if (/^fill in the blank/i.test(trimmed)) return "खाली स्थान भरें";
  if (/^write this in english/i.test(trimmed)) return "इसे अंग्रेज़ी में लिखें";
  if (/^write this in french/i.test(trimmed)) return "इसे फ़्रेंच में लिखें";
  if (/^write this in spanish/i.test(trimmed)) return "इसे स्पैनिश में लिखें";
  if (/^translate this sentence/i.test(trimmed)) return "इस वाक्य का अनुवाद करें";
  if (/^translate into french/i.test(trimmed)) return "फ़्रेंच में अनुवाद करें";
  if (/^translate into english/i.test(trimmed)) return "अंग्रेज़ी में अनुवाद करें";
  if (/^translate into spanish/i.test(trimmed)) return "स्पैनिश में अनुवाद करें";
  if (/^complete the sentence/i.test(trimmed)) return "वाक्य पूरा करें";

  return prompt;
}
