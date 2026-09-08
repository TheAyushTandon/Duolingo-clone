export const QUESTION_SVGS = [
  "/question-svgs/mom.svg",
  "/question-svgs/dad.svg",
  "/question-svgs/cat.svg",
  "/question-svgs/dog.svg",
  "/question-svgs/car.svg",
  "/question-svgs/water.svg",
  "/question-svgs/boy.svg",
  "/question-svgs/girl.svg",
  "/question-svgs/man.svg",
  "/question-svgs/woman.svg",
  "/question-svgs/robot.svg",
  "/question-svgs/zombie.svg",
] as const;

export function getQuestionSvg(seed?: string, indexOffset = 0): string {
  if (!seed) {
    const randomIndex = Math.floor(Math.random() * QUESTION_SVGS.length);
    return QUESTION_SVGS[randomIndex];
  }
  // Deterministic hash so the avatar is stable per question but varies across questions
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash + indexOffset) % QUESTION_SVGS.length;
  return QUESTION_SVGS[idx];
}

export function matchOptionSvg(text: string, index = 0): string {
  const lower = text.toLowerCase().trim();
  if (lower.includes("cat") || lower.includes("chat") || lower.includes("gato")) return "/question-svgs/cat.svg";
  if (lower.includes("dog") || lower.includes("chien") || lower.includes("perro")) return "/question-svgs/dog.svg";
  if (lower.includes("car") || lower.includes("voiture") || lower.includes("auto") || lower.includes("coche")) return "/question-svgs/car.svg";
  if (lower.includes("water") || lower.includes("eau") || lower.includes("agua")) return "/question-svgs/water.svg";
  if (lower.includes("mom") || lower.includes("maman") || lower.includes("mère") || lower.includes("madre")) return "/question-svgs/mom.svg";
  if (lower.includes("dad") || lower.includes("papa") || lower.includes("père") || lower.includes("padre")) return "/question-svgs/dad.svg";
  if (lower.includes("boy") || lower.includes("garçon") || lower.includes("chico") || lower.includes("niño")) return "/question-svgs/boy.svg";
  if (lower.includes("girl") || lower.includes("fille") || lower.includes("chica") || lower.includes("niña")) return "/question-svgs/girl.svg";
  if (lower.includes("man") || lower.includes("homme") || lower.includes("hombre")) return "/question-svgs/man.svg";
  if (lower.includes("woman") || lower.includes("femme") || lower.includes("mujer")) return "/question-svgs/woman.svg";
  if (lower.includes("robot")) return "/question-svgs/robot.svg";
  if (lower.includes("zombie")) return "/question-svgs/zombie.svg";
  return QUESTION_SVGS[index % QUESTION_SVGS.length];
}
