import { useQuery } from "@tanstack/react-query";

import { useToggleLikeMutation } from "./useToggleLikeMutation";

import { fetchLikeList } from "@/lib/query/like/fetchLike";
import { queryKeys } from "@/lib/query/querykeys";
import { Book } from "@/types/book";

/**
 * 특정 아이템의 '좋아요' 상태를 확인하고, '좋아요'를 토글하는 기능을 제공하는 훅.
 * @param item - '좋아요' 상태를 확인할 BookDataType 객체
 * @returns \{ isLiked, toggleLike, isPending \}
 *          - isLiked: 현재 '좋아요' 상태 (boolean)
 *          - toggleLike: '좋아요' 상태를 변경하는 함수
 *          - isPending: '좋아요' 상태 변경이 진행 중인지 여부 (boolean)
 */
export const useLikeHandler = (item: Book) => {
  const { mutate } = useToggleLikeMutation();

  // '좋아요' 목록 데이터를 가져와서 현재 아이템의 '좋아요' 상태를 결정
  const { data: likeList = [] } = useQuery<Book[]>({
    queryKey: queryKeys.likes.list(),
    queryFn: fetchLikeList, // 명시적으로 전달
    enabled: !!item,
  });
  const isLiked = likeList.some((v) => v.isbn === item.isbn);
  const toggleLike = () => {
    if (item) {
      mutate(item);
    }
  };

  return {
    likeList,
    isLiked,
    toggleLike,
  };
};
