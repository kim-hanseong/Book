import React from "react";
import clsx from "clsx";

import styles from "./index.module.css";

/**
 * 장바구니 삭제버튼
 */
export const DeleteButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      className={clsx(styles.modalClose, className)}
      onClick={onClick}
      aria-label="Delete Btn"
    >
      ✕
    </button>
  );
};
