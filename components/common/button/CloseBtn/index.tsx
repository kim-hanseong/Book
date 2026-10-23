import React from "react";
import clsx from "clsx";

import styles from "./index.module.css";

/**
 * 모달 닫기 버튼
 */
export const CloseButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className }) => {
  return (
    <button
      type="button"
      className={clsx(styles.modalClose, className)}
      onClick={onClick}
      aria-label="Close modal"
    >
      ✕
    </button>
  );
};
