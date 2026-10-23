import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/querykeys";
import { Book } from "@/types/book";
import { useModalStack } from "@/components/hook/useContextModal";
import ErrorModal from "@/components/common/Modal/GlobalModal/ErrorModal";
import { addToCartApi, removeFromCartApi } from "@/lib/api/shopAction";

export const useToggleShopMutation = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStack();

  const mutation = useMutation({
    mutationFn: async (item: Book) => {
      const shopList: Book[] =
        queryClient.getQueryData(queryKeys.cart.list()) || [];
      const isInCart = shopList.some((v) => v.thumbnail === item.thumbnail);

      if (!isInCart) {
        const res = await removeFromCartApi(item);

        if (res?.error) throw new Error(res.error);

        return { action: "remove" as const };
      } else {
        const res = await addToCartApi(item);

        if (res?.error) throw new Error(res.error);

        return { action: "add" as const };
      }
    },

    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.list() });

      const previousShopList = queryClient.getQueryData<Book[]>(
        queryKeys.cart.list(),
      );

      queryClient.setQueryData<Book[]>(queryKeys.cart.list(), (old = []) => {
        const isInCart = old.some((v) => v.thumbnail === newItem.thumbnail);

        if (isInCart) {
          return old.filter((v) => v.thumbnail !== newItem.thumbnail);
        } else {
          return [...old, newItem];
        }
      });

      return { previousShopList };
    },

    // 2. 실패 시 이전 상태로 롤백 및 에러 로그 출력
    onError: (err, newItem, context) => {
      console.error("❌ Mutation 실행 중 에러 발생:", err); // 터미널/콘솔에서 원인 확인용

      if (context?.previousShopList) {
        queryClient.setQueryData(
          queryKeys.cart.list(),
          context.previousShopList,
        );
      }
      openModal("error-modal", <ErrorModal />);
    },

    // 3. 작업 완료 후 동기화 (onSuccess 대신 onSettled 사용)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.list() });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
};
