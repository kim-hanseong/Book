import { LikeDataBase } from "@/lib/api/likemutate";
import { Book } from "@/types/book";

export const fetchLikeList = async (): Promise<Book[]> => {
  const { data } = await LikeDataBase();

  return data ?? [];
};
