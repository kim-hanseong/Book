import { AtomEffect } from "recoil";

export const sessionStorageEffect =
  <T>(key: string): AtomEffect<T> =>
  ({ setSelf, onSet }) => {
    if (typeof window === "undefined") return;

    const savedValue = sessionStorage.getItem(key);

    if (savedValue != null) {
      try {
        setSelf(JSON.parse(savedValue));
      } catch (error) {
        console.error(
          `Failed to parse session storage value for "${key}":`,
          error,
        );
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(newValue));
    });
  };
