import { useState, useEffect } from "react";

const STORAGE_KEY = "recent_searches";
const MAX_LIMIT = 5;

export function useRecentSearches() {
  const [recentTitles, setRecentTitles] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setRecentTitles(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recent searches from localStorage", e);
    }
  }, []);

  const addSearchTitle = (title: string) => {
    const trimmed = title;

    if (!trimmed) return;

    setRecentTitles((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_LIMIT);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save recent search to localStorage", e);
      }

      return next;
    });
  };

  const removeSearchTitle = (title: string) => {
    setRecentTitles((prev) => {
      const next = prev.filter((item) => item !== title);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to remove recent search", e);
      }

      return next;
    });
  };

  const clearAll = () => {
    setRecentTitles([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear recent searches", e);
    }
  };

  return { recentTitles, addSearchTitle, removeSearchTitle, clearAll };
}
