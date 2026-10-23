import { ShopDataBase } from "@/lib/api/shopAction";
import { Book } from "@/types/book";

export const fetchBuyList = async (): Promise<Book[]> => {
  const { data } = await ShopDataBase();

  return data ?? [];
};
