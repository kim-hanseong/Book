import React from "react";

import DetailModal from "../../Modal/DetailModal";

import { Book } from "@/types/book";
import { useModalStack } from "@/components/hook/useContextModal";

interface BuyButtonProps {
  data: Book;
  className?: string;
  children?: React.ReactNode; // 👈 버튼 내부 텍스트나 아이콘을 렌더링하기 위해 추가
}

export const DetailBtn: React.FC<BuyButtonProps> = ({ data, children }) => {
  const { openModal } = useModalStack();

  const handleOpenDetailModal = (bookData: Book) => {
    openModal("detail-modal", <DetailModal data={bookData} />);
  };

  return (
    <div
      role="button"
      onClick={() => {
        handleOpenDetailModal(data);
      }}
    >
      {children}
    </div>
  );
};
