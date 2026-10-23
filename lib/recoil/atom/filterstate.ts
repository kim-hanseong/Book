import { atom } from "recoil";
import { sessionStorageEffect } from "../effects/sessionStorageEffect";

export interface FilterState {
  year: string | number;
  category: string;
  sort: string;
  form: "Col" | "Basis";
}

export const filterStateAtom = atom<FilterState>({
  key: "filterState",
  default: {
    year: "전체",
    category: "국내도서",
    sort: "추천일순",
    form: "Basis",
  },
});
