import React from "react";

import styles from "./index.module.css";

export function Skeleton({
  w,
  h,
  className,
}: {
  w?: number;
  h?: number;
  className?: string;
}) {
  return (
    <div
      className={`${styles.skeletonAuthor} ${className ?? ""}`}
      style={{
        width: `${w}px`,
        height: `${h}px`,
      }}
    />
  );
}
