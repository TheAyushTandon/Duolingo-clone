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

  // Settings Page
  "Site Language": "साइट भाषा",
  "Choose your preferred language for the Duolingo interface and lesson questions.":
    "डुओलिंगो इंटरफ़ेस और अभ्यास प्रश्नों के लिए अपनी पसंदीदा भाषा चुनें।",
  "Language updated to English!": "Language updated to English!",
  "Daily goal": "दैनिक लक्ष्य",
  "Daily goal saved!": "दैनिक लक्ष्य सहेजा गया!",
  "Daily goal complete!": "दैनिक लक्ष्य पूरा हुआ!",
  "Set a daily XP goal to stay motivated and keep your streak going.":
    "प्रेरित रहने और अपनी लकीर जारी रखने के लिए दैनिक XP लक्ष्य निर्धारित करें।",
  "Experience": "अनुभव",
  "Sound effects": "ध्वनि प्रभाव",
  "Feedback sounds and narration": "प्रतिक्रिया ध्वनियाँ और उच्चारण",
  "Dark mode": "डार्क मोड",
  "Toggle light/dark appearance": "हल्का/गहरा रूप बदलें",
  "Coming soon": "जल्द आ रहा है",
  "Speech recognition": "भाषण पहचान",
  "Pronunciation exercises with real voice scoring": "वास्तविक आवाज़ स्कोरिंग के साथ उच्चारण अभ्यास",
  "Unlimited hearts, no ads, and legendary lessons": "असीमित दिल, बिना विज्ञापन और लेजेंडरी पाठ",
  "Friends & social": "मित्र और सामाजिक",
  "Follow friends and share leaderboards": "दोस्तों को फ़ॉलो करें और लीडरबोर्ड साझा करें",
  "Sign out": "साइन आउट करें",
  "5 min / day": "5 मिनट / दिन",
  "10 min / day": "10 मिनट / दिन",
  "15 min / day": "15 मिनट / दिन",
  "20 min / day": "20 मिनट / दिन",

  // Roadmap & Dashboard Widgets
  "SECTION": "अनुभाग",
  "UNIT": "इकाई",
  "Unit": "इकाई",
  "GUIDEBOOK": "मार्गदर्शिका",
  "Guidebook": "मार्गदर्शिका",
  "START": "शुरू करें",
  "PRACTICE": "अभ्यास करें",
  "Practice": "अभ्यास करें",
  "Level": "स्तर",
  "of": "का",
  "Locked": "बंद",
  "Completed": "पूर्ण",
  "Complete previous lessons to unlock": "अनलॉक करने के लिए पिछले पाठ पूरे करें",
  "Checkpoint Reached! (+20 Gems)": "चेकपॉइंट पहुंचा! (+20 रत्न)",
  "Unit Mastered! 🏆": "इकाई पूरी की! 🏆",
  "XP today": "XP आज",
  "Keep going to earn more!": "और अधिक कमाने के लिए सीखते रहें!",
  "XP to go — keep your streak alive!": "XP शेष — अपनी लकीर बनाए रखें!",
  "View all": "सभी देखें",
  "Earn": "कमाएं",
  "Complete": "पूरा करें",
  "lessons": "पाठ",
  "Completed!": "पूर्ण हुआ!",
  "Upgrade to Pro": "प्रो में अपग्रेड करें",
  "Get unlimited hearts and more!": "असीमित दिल और बहुत कुछ पाएं!",
  "Upgrade today": "आज ही अपग्रेड करें",
  "Essential Key Phrases": "आवश्यक मुख्य वाक्यांश",
  "Match the greetings": "अभिवादन का मिलान करें",
  "Match the pairs": "जोड़ों का मिलान करें",
  "Match the words": "शब्दों का मिलान करें",
  "Match the foods": "खाद्य पदार्थों का मिलान करें",
  "Match the animals": "जानवरों का मिलान करें",
  "Complete the phrase": "वाक्यांश पूरा करें",

  // Streak & Popover
  "day streak": "दिनों की लकीर",
  "Great job! You extended your streak today!": "बहुत बढ़िया! आपने आज अपनी लकीर बढ़ा ली!",
  "Do a lesson today to extend your streak!": "अपनी लकीर बढ़ाने के लिए आज एक पाठ पूरा करें!",
  "Streak Society": "स्ट्रीक सोसाइटी",
  "Reach a 7 day streak to join the Streak Society and earn exclusive rewards.":
    "स्ट्रीक सोसाइटी में शामिल होने और विशेष पुरस्कार अर्जित करने के लिए 7 दिनों की लकीर बनाएं।",
  "VIEW MORE": "और देखें",
  "View more": "और देखें",

  // Courses & Languages
  "French": "फ़्रेंच",
  "Spanish": "स्पैनिश",
  "English": "अंग्रेज़ी",
  "German": "जर्मन",
  "Italian": "इतालवी",
  "Japanese": "जापानी",

  // Grammar & Guidebook Tips
  "Grammar Tip: Genders & Articles": "व्याकरण सुझाव: लिंग और उपपद",
  "In Spanish, nouns are either masculine or feminine. Words ending in -o are usually masculine (e.g., el café, el niño), while words ending in -a are usually feminine (e.g., la manzana, la niña).":
    "स्पैनिश में संज्ञाएं या तो पुल्लिंग होती हैं या स्त्रीलिंग। -o पर समाप्त होने वाले शब्द आमतौर पर पुल्लिंग होते हैं (जैसे el café, el niño), जबकि -a पर समाप्त होने वाले शब्द आमतौर पर स्त्रीलिंग होते हैं (जैसे la manzana, la niña)।",

  // Quests & Shop
  "Monthly challenges unlock soon!": "मासिक चुनौतियाँ जल्द अनलॉक होंगी!",
  "Complete each month's challenge to earn exclusive badges":
    "विशेष बैज अर्जित करने के लिए प्रत्येक माह की चुनौती पूरी करें",
  "Start a lesson": "पाठ शुरू करें",
  "Daily Challenges": "दैनिक चुनौतियाँ",
  "Daily Quests": "दैनिक मिशन",
  "RESETS AT MIDNIGHT": "आधी रात को रीसेट होता है",
  "Resets at midnight": "आधी रात को रीसेट होता है",
  "Your gem balance": "आपके रत्नों का संतुलन",
  "Get full hearts so you can worry less about making mistakes in a lesson":
    "पूरे दिल पाएं ताकि आप पाठ में गलतियों की चिंता न करें",
  "Unlimited Hearts": "असीमित दिल",
  "Never run out of hearts with Super Duolingo!": "सुपर डुओलिंगो के साथ कभी भी दिल खत्म न हों!",
  "FULL": "भरा हुआ",
  "Set your status": "अपनी स्थिति सेट करें",

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

  // Dynamic Regex and Pattern matching for question prompts
  const whatDoesMatch = trimmed.match(/^what does ['"]?([^'"]+)['"]? mean\??$/i);
  if (whatDoesMatch) {
    return `'${whatDoesMatch[1]}' का क्या अर्थ है?`;
  }

  const translateIntoFrenchMatch = trimmed.match(/^translate into french:\s*(.+)$/i);
  if (translateIntoFrenchMatch) {
    return `फ़्रेंच में अनुवाद करें: ${translateIntoFrenchMatch[1]}`;
  }

  const translateIntoEnglishMatch = trimmed.match(/^translate into english:\s*(.+)$/i);
  if (translateIntoEnglishMatch) {
    return `अंग्रेज़ी में अनुवाद करें: ${translateIntoEnglishMatch[1]}`;
  }

  const translateIntoSpanishMatch = trimmed.match(/^translate into spanish:\s*(.+)$/i);
  if (translateIntoSpanishMatch) {
    return `स्पैनिश में अनुवाद करें: ${translateIntoSpanishMatch[1]}`;
  }

  const completeMatch = trimmed.match(/^complete:\s*(.+)$/i);
  if (completeMatch) {
    return `पूरा करें: ${completeMatch[1]}`;
  }

  const matchCustom = trimmed.match(/^match the (.+)$/i);
  if (matchCustom) {
    const item = matchCustom[1].toLowerCase();
    if (item === "greetings") return "अभिवादन का मिलान करें";
    if (item === "pairs") return "जोड़ों का मिलान करें";
    if (item === "words") return "शब्दों का मिलान करें";
    if (item === "foods") return "खाद्य पदार्थों का मिलान करें";
    if (item === "animals") return "जानवरों का मिलान करें";
    return `${matchCustom[1]} का मिलान करें`;
  }

  if (/^tap the matching pairs/i.test(trimmed)) return "मिलान वाले जोड़ों पर टैप करें";
  if (/^select the correct (meaning|answer)/i.test(trimmed)) return "सही अर्थ चुनें";
  if (/^choose the correct (meaning|answer)/i.test(trimmed)) return "सही विकल्प चुनें";
  if (/^tap what you hear/i.test(trimmed)) return "जो आप सुनते हैं उस पर टैप करें";
  if (/^type what you hear/i.test(trimmed)) return "जो आप सुनते हैं उसे टाइप करें";
  if (/^fill in the blank/i.test(trimmed)) return "खाली स्थान भरें";
  if (/^complete the phrase/i.test(trimmed)) return "वाक्यांश पूरा करें";
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
