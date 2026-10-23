"use client";

import { useState, useEffect } from "react";

import { Language } from "@/types/il8n";
import {
  PERSONA_DICTIONARY,
  PersonaItem,
} from "@/constants/main/AiReviewSelect";

const STORAGE_KEY = "selected_persona_id";

export function usePersonaStorage(lang: Language) {
  const dict = PERSONA_DICTIONARY[lang];
  const defaultPersona = dict.personas[0];

  const [selectedPersona, setSelectedPersona] =
    useState<PersonaItem>(defaultPersona);

  // 1. 초기 로드 (Client-side에서만 동작)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cachedId = sessionStorage.getItem(STORAGE_KEY);

    if (cachedId) {
      const found = dict.personas.find((p) => p.id === cachedId);

      if (found) {
        setSelectedPersona(found);

        return;
      }
    }
    // 캐시가 없거나 유효하지 않으면 기본 첫 번째 캐릭터 설정
    setSelectedPersona(defaultPersona);
  }, [lang]);

  // 2. 캐릭터 변경 및 캐시 저장 함수
  const changePersona = (personaId: string) => {
    const target = dict.personas.find((p) => p.id === personaId);

    if (target) {
      setSelectedPersona(target);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, personaId);
      }
    }
  };

  return {
    selectedPersona,
    changePersona,
  };
}

// ----------------------------------------------------
// 아래 구문을 맨 끝에 추가하면 import 방식 구별 없이 작동합니다.
// ----------------------------------------------------
export default usePersonaStorage;
