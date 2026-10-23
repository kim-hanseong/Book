import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/querykeys";
import { Book } from "@/types/book";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";
import { useToggleShopMutation } from "./useToggleBuyMutation";

/**
 * 특정 아이템의 장바구니 담김 상태를 확인하고, 장바구니 상태를 토글하는 기능을 제공하는 훅.
 */
export const useShopHandler = (item?: Book) => {
  const { mutate, isPending } = useToggleShopMutation();

  // 장바구니 목록 조회 (staleTime을 주어 불필요한 연쇄 refetch 방지)
  const { data: shopList = [] } = useQuery<Book[]>({
    queryKey: queryKeys.cart.list(),
    queryFn: fetchBuyList,
    enabled: !!item,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유효
  });

  const isInCart = Boolean(
    item &&
      shopList.some((v) =>
        v.isbn && item.isbn ? v.isbn === item.isbn : v.title === item.title,
      ),
  );

  const toggleCart = (e?: React.MouseEvent | React.SyntheticEvent) => {
    if (e && "stopPropagation" in e) {
      e.stopPropagation();
    }

    if (!item || isPending) return;

    mutate(item);
  };

  return {
    shopList,
    isInCart,
    toggleCart,
    isPending, // UI 버튼 비활성화용
  };
};
