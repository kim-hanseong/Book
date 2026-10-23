import Link from "next/link";
import React from "react";

import { Book } from "@/types/book";

interface BuyButtonProps {
  data: Book;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void; // 👈 onClick 타입 추가
  children?: React.ReactNode; // 👈 버튼 내부 텍스트나 아이콘을 렌더링하기 위해 추가
}

export const FocusBtn: React.FC<BuyButtonProps> = ({
  data,
  className,
  onClick,
  children,
}) => {
  return (
    <Link
      href={`/test/${encodeURIComponent(
        data.isbn,
      )}/${encodeURIComponent(data.title)}`}
      role="button"
      className={className}
      onClick={onClick} // 👈 Link에 onClick 전달
    >
      {children}
    </Link>
  );
};
