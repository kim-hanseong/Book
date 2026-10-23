import { cookies } from "next/headers";

type FilterState = {
  year: string | number;
  category: string;
  sort: "추천일순" | "출판일순";
  form: string;
};

export function loadBestsellerFilterStateFromCookie(
  defaultCategory: string
): FilterState {
  const cookieStore = cookies();
  const filterStateCookie = cookieStore.get("filterState");

  const defaultState: FilterState = {
    year: "전체",
    category: defaultCategory,
    sort: "추천일순",
    form: "Basis",
  };

  if (!filterStateCookie) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(filterStateCookie.value);

    return {
      ...defaultState,
      year: parsed.year ?? defaultState.year,
      category: parsed.category ?? defaultState.category,
      sort: parsed.sort ?? defaultState.sort,
      form: parsed.form ?? defaultState.form,
    };
  } catch {
    console.warn("Failed to parse filterState cookie, using default values.");
    return defaultState;
  }
}
