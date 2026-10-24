import { CiHeart } from "react-icons/ci";
import clsx from "clsx";

import AuthButton from "../AuthBtn";

import styles from "./index.module.css";

import { useLikeHandler } from "@/Hook/LikeBtn/useLikeHandler";
import { Book } from "@/types/book";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  data: Book;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const LikeButton = ({ data, className, onClick }: LikeButtonProps) => {
  const { isLiked, toggleLike } = useLikeHandler(data);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 부모 클릭(모달 오픈 등) 막기
    toggleLike();
    onClick?.(e);
  };

  return (
    <AuthButton className={clsx(styles.Like, className)} onClick={handleClick}>
      {isLiked ? (
        <Heart color="#fff" strokeWidth={0.3} />
      ) : (
        <Heart strokeWidth={0.3} />
      )}
    </AuthButton>
  );
};
