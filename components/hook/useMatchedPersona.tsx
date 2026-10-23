import { PERSONA_DICTIONARY } from "@/constants/main/AiReviewSelect";
import { useMemo } from "react";
import { useLanguage } from "./useContextLanguge";

export function useMatchedPersona(id) {
  const { lang } = useLanguage();

  return useMemo(() => {
    if (!id) return null;
    const personas = PERSONA_DICTIONARY[lang]?.personas || [];
    return personas.find((p) => p.id === id || p.name === id) ?? null;
  }, [id, lang]);
}
