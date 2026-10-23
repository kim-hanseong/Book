// hooks/useMultiModal.ts
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect, useRef, useCallback } from "react";

import { ModalAtom } from "@/recoil/Modal/atom";

export function useMultiModal() {
  const [modalMap, setModalMap] = useRecoilState(ModalAtom);
  const modalMapValue = useRecoilValue(ModalAtom);
  const prevModalMapRef = useRef(modalMapValue);
  const callbacksRef = useRef<
    Map<string, { onOpen?: () => void; onClose?: () => void }>
  >(new Map());

  // 모달 상태 변화 감지
  useEffect(() => {
    const prevModalMap = prevModalMapRef.current;
    const currentModalMap = modalMapValue;

    // 변경된 모달들 찾기
    const changedModals = Object.keys(currentModalMap).filter(
      (modalType) => prevModalMap[modalType] !== currentModalMap[modalType]
    );

    if (changedModals.length > 0) {
      changedModals.forEach((modalType) => {
        const isOpen = currentModalMap[modalType];
        const callbacks = callbacksRef.current.get(modalType);

        if (isOpen && callbacks?.onOpen) {
          callbacks.onOpen();
        } else if (!isOpen && callbacks?.onClose) {
          callbacks.onClose();
        }

        // console.log(`Modal ${modalType} ${isOpen ? "opened" : "closed"}`);
      });
    }

    prevModalMapRef.current = currentModalMap;
  }, [modalMapValue]);

  const useModalStateChange = useCallback(
    (modalType: string, onOpen?: () => void, onClose?: () => void) => {
      // 콜백 등록
      callbacksRef.current.set(modalType, { onOpen, onClose });

      // 현재 모달 상태 반환
      return modalMap[modalType] ?? false;
    },
    [modalMap]
  );

  const openModal = (type: string) => {
    setModalMap((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: string) => {
    setModalMap((prev) => ({ ...prev, [type]: false }));
  };

  const toggleModal = (type: string) => {
    setModalMap((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const isModalOpen = (type: string) => modalMap[type] ?? false;

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    useModalStateChange,
  };
}
