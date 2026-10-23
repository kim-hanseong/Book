import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { fetchBestsellerBooks } from "@/lib/query/book/fetchBooks";
import { queryKeys } from "@/lib/query/querykeys";
import { BookDataType } from "@/types/il8n";

/**
 * @function useBooks
 * @summary 베스트셀러 도서 데이터를 비동기적으로 가져오는 커스텀 React Query 훅.
 * @description 카테고리와 정렬 기준에 따라 도서 목록을 페칭하며, 서버에서 제공된 초기 데이터를 사용하여 하이드레이션을 지원합니다.
 *
 * @param {BookDataType[] | undefined} initialBooks - 서버에서 SSG/SSR을 통해 제공된 초기 도서 데이터.
 *                                                  클라이언트 측 useQuery의 initialData로 사용되어 즉각적인 UI 렌더링을 가능하게 합니다.
 * @param {string} category - 가져올 도서의 카테고리 (예: "domestic", "foreign").
 * @param {string} sort - 도서를 정렬할 기준 (예: "sales", "popularity").
 *
 * @returns {object} 쿼리 결과 및 관련 상태를 포함하는 객체.
 * @property {BookDataType[]} data - 페칭된 도서 데이터 배열. 기본값은 빈 배열입니다.
 * @property {boolean} isLoading - 쿼리가 처음 로딩 중인지 여부.
 * @property {any} error - 쿼리 실행 중 발생한 오류 객체.
 * @property {boolean} isFetching - 쿼리가 백그라운드에서 데이터를 다시 가져오는 중인지 여부.
 * @property {boolean} isError - 쿼리 실행 중 오류가 발생했는지 여부.
 * @property {boolean} isPlaceholderData - 현재 데이터가 placeholder 데이터인지 여부 (keepPreviousData 사용 시).
 */
export const useBooks = (
  initialBooks: BookDataType[] | undefined,
  category: string,
  sort: string,
) => {
  const {
    data = [], // 데이터가 없을 경우 기본값으로 빈 배열을 사용합니다.
    isLoading, // 쿼리가 처음 로딩 중인지 나타냅니다.
    error, // 쿼리 실행 중 발생한 오류 객체입니다.
    isFetching, // 쿼리가 백그라운드에서 데이터를 다시 가져오는 중인지 나타냅니다.
    isError, // 쿼리 실행 중 오류가 발생했는지 나타냅니다.
    isPlaceholderData, // 현재 데이터가 placeholder 데이터인지 나타냅니다 (keepPreviousData 사용 시).
  } = useQuery<BookDataType[]>({
    // queryKey: 쿼리를 고유하게 식별하는 키. category와 sort 값에 따라 동적으로 생성됩니다.
    // 이 키가 변경되면 React Query는 새로운 데이터를 페칭합니다.
    queryKey: queryKeys.books.bestsellers(category, sort),

    // queryFn: 데이터를 실제로 가져오는 비동기 함수. queryKey에 해당하는 데이터를 반환합니다.
    queryFn: () => fetchBestsellerBooks(category, sort),

    // initialData: 서버에서 미리 가져온 초기 데이터.
    // 클라이언트 측에서 쿼리가 처음 실행될 때 이 데이터를 사용하여 즉시 UI를 렌더링합니다.
    // 이는 SSR/SSG 환경에서 하이드레이션을 위해 사용됩니다.
    initialData: initialBooks,

    // placeholderData: 새로운 데이터를 페칭하는 동안 이전 데이터를 계속 표시할지 여부.
    // keepPreviousData를 사용하면 새로운 데이터가 로드될 때까지 이전 데이터를 보여주어 UI 깜빡임을 방지합니다.
    placeholderData: keepPreviousData,

    // refetchOnWindowFocus: 브라우저 창이 다시 포커스될 때 데이터를 자동으로 다시 가져올지 여부.
    // false로 설정하여 불필요한 네트워크 요청을 줄입니다.
    refetchOnWindowFocus: false,
    refetchOnMount: false,

    // staleTime: 0: 데이터가 항상 '오래된(stale)' 것으로 간주됩니다.
    // 이는 initialData가 제공되더라도, 컴포넌트가 마운트되거나 쿼리 키가 변경되면 즉시 백그라운드에서 데이터를 다시 가져오도록 합니다.
  });

  return {
    data,
    isLoading,
    isError,
    error,
    category, // 쿼리 파라미터로 사용된 category를 반환하여 디버깅 등에 활용할 수 있습니다.
    sort, // 쿼리 파라미터로 사용된 sort를 반환하여 디버깅 등에 활용할 수 있습니다.
    isPlaceholderData,
    isFetching,
  };
};
