// hooks/useRecentSearch.ts
import { useState, useEffect } from "react";

const STORAGE_KEY = "recentSearch";

export const useRecentSearch = () => {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    setSearches(stored);
  }, []);

  const addSearch = (term: string) => {
    const updated = [term, ...searches.filter((s) => s !== term)].slice(0, 7); // 중복 제거 + 10개 제한

    setSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteSearch = (index: number) => {
    const updated = [...searches];

    updated.splice(index, 1);
    setSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    searches,
    addSearch,
    deleteSearch,
    clearAll,
  };
};
