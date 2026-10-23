import { useEffect } from "react";

import { useMultiModal } from "./useMultiModal";

import { MODAL_TYPES } from "@/components/common/ModalRegistry/modaltype";

export const useLoadingIndicator = (isLoading: boolean) => {
  const { openModal, closeModal } = useMultiModal();

  useEffect(() => {
    if (isLoading) openModal(MODAL_TYPES.LOADING.key);
    else closeModal(MODAL_TYPES.LOADING.key);
  }, [isLoading]);
};
