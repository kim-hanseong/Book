import React from "react";

import DetailModal from "../../Modal/DetailModal";

import { Book } from "@/types/book";
import { useModalStack } from "@/components/hook/useContextModal";

interface BuyButtonProps {
  data: Book;
  className?: string;
  children?: React.ReactNode; // 👈 버튼 내부 텍스트나 아이콘을 렌더링하기 위해 추가
}

export const DetailBtn: React.FC<BuyButtonProps> = ({
  data,
  className,
  children,
}) => {
  const { openModal } = useModalStack();

  const handleOpenDetailModal = (bookData: Book) => {
    openModal("detail-modal", <DetailModal data={bookData} />);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    handleOpenDetailModal(data);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    handleOpenDetailModal(data);
  };

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};
