import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/querykeys";
import { addLike, RemoveLikeDataBase } from "@/lib/api/likemutate";
import { Book } from "@/types/book";
import { useModalStack } from "@/components/hook/useContextModal";
import ErrorModal from "@/components/common/Modal/GlobalModal/ErrorModal";

export const useToggleLikeMutation = () => {
  const queryClient = useQueryClient();
  const { openModal } = useModalStack();

  const mutation = useMutation({
    mutationFn: async (item: Book) => {
      const likeList: Book[] =
        queryClient.getQueryData(queryKeys.likes.list()) || [];
      const isLiked = likeList.some((v) => v.isbn === item.isbn);

      if (isLiked) {
        await addLike(item);

        return { action: "add" as const };
      } else {
        await RemoveLikeDataBase(item);

        return { action: "remove" as const };
      }
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.likes.list() });
      const previousLikes = queryClient.getQueryData<Book[]>(
        queryKeys.likes.list(),
      );

      queryClient.setQueryData<Book[]>(
        queryKeys.likes.list(),
        (old: Book[] = []) => {
          const isLiked = old.some((v) => v.isbn === newItem.isbn);

          if (isLiked) {
            return old.filter((v) => v.isbn !== newItem.isbn);
          } else {
            return [...old, newItem];
          }
        },
      );

      return { previousLikes };
    },
    onError: (er, newItem, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(queryKeys.likes.list(), context.previousLikes);
      }
      openModal("error-modal", <ErrorModal />);

      // openModal("detail-modal", <DetailModal data={bookData} />);
    },
    onSuccess: (data) => {
      if (data.action === "add") {
        queryClient.invalidateQueries({ queryKey: queryKeys.likes.list() });
      }
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
};
