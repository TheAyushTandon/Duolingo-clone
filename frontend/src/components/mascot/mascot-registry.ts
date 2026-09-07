import { MascotMood } from "./DuoMascot";

export const mascotRegistry: Record<MascotMood, { title: string }> = {
  happy: { title: "Duo is cheering for you!" },
  celebrate: { title: "Lesson Complete! Fantastic job!" },
  sad: { title: "Oh no, you ran out of hearts!" },
  thinking: { title: "Duo is pondering your answer..." },
  excited: { title: "Streak on fire!" }
};
