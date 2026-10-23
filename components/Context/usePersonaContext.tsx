"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "selected_persona_id";

interface PersonaContextType {
  selectedPersonaId: string; // 현재 확정된/선택된 페르소나 ID
  setSelectedPersonaId: (id: string) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [selectedPersonaId, setSelectedPersonaIdState] = useState<string>("");

  // 앱 로드 시 기존 세션스토리지 초기값 세팅 (선택 사항 및 동기화용)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const cachedId = sessionStorage.getItem(STORAGE_KEY);
    if (cachedId) {
      setSelectedPersonaIdState(cachedId);
    }
  }, []);

  const setSelectedPersonaId = (id: string) => {
    setSelectedPersonaIdState(id);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, id);
    }
  };

  return (
    <PersonaContext.Provider
      value={{ selectedPersonaId, setSelectedPersonaId }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
};
