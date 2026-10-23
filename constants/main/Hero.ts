import { Language } from "@/types/il8n";

export interface HeroDictionary {
  eyebrow: string;
  titlePart1: string;
  titleAccent: string;
  titlePart2: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  scrollCue: string;
}

export const HERO_DICTIONARY: Record<Language, HeroDictionary> = {
  ko: {
    eyebrow: "— 심연에서 건져 올린 이야기들 —",
    titlePart1: "모든 책은",
    titleAccent: "잃어버린 기억",
    titlePart2: "이다",
    description:
      "이곳의 서가는 지도가 아니라 깊이로 정렬됩니다. 마음에 드는 펄을 건드리면, 그 안에 담긴 이야기가 흘러나옵니다.",
    ctaPrimary: "서가로 내려가기",
    ctaSecondary: "읽고 있는 펄 보기",
    scrollCue: "SCROLL",
  },
  en: {
    eyebrow: "— Stories Retrieved from the Abyss —",
    titlePart1: "Every book is a ",
    titleAccent: "lost memory",
    titlePart2: " of someone",
    description:
      "The shelves here are sorted by depth, not by map. Touch a pearl that draws you, and the story within will flow.",
    ctaPrimary: "Descend to Shelves",
    ctaSecondary: "View Reading Pearls",
    scrollCue: "SCROLL",
  },
};
