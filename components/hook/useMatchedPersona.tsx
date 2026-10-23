import { useMemo } from "react";

import { useLanguage } from "./useContextLanguge";

import { PERSONA_DICTIONARY } from "@/constants/main/AiReviewSelect";

export function useMatchedPersona(id) {
  const { lang } = useLanguage();

  return useMemo(() => {
    if (!id) return null;
    const personas = PERSONA_DICTIONARY[lang]?.personas || [];

    return personas.find((p) => p.id === id || p.name === id) ?? null;
  }, [id, lang]);
}
