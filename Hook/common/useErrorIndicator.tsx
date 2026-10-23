import { useEffect } from "react";
import { useMultiModal } from "./useMultiModal"; // 네가 만든 멀티모달 훅
import { MODAL_TYPES } from "@/components/common/ModalRegistry/modaltype"; // 네 모달 타입들

// error 객체에 status가 있을 수 있다고 가정
interface CustomError extends Error {
  response?: {
    status?: number;
  };
}

export function useErrorAlert(isError: boolean, error: CustomError | null) {
  const { openModal } = useMultiModal();

  useEffect(() => {
    if (isError && error) {
      // 에러 객체를 분석해서 어떤 모달을 열지 결정!
      switch (error.response?.status) {
        case 401:
          // 예: 권한 없음 에러 -> 로그인 유도 모달
          openModal(MODAL_TYPES.LOGIN_REQUIRED.key);
          break;
        case 404:
          // 예: 찾을 수 없음 에러 -> "데이터를 찾을 수 없습니다" 모달
          openModal(MODAL_TYPES.NOT_FOUND_ERROR.key);
          break;
        case 500:
        case 503:
          // 예: 서버 에러 -> "서버에 문제가 발생했습니다" 모달
          openModal(MODAL_TYPES.SERVER_ERROR.key);
          break;
        default:
          // 그 외 모든 알 수 없는 에러 -> 일반적인 에러 모달
          openModal(MODAL_TYPES.GENERIC_ERROR.key);
          break;
      }
    }
  }, [isError, error, openModal]);
}
