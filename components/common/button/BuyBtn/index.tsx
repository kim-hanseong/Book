import React from "react";
import clsx from "clsx";
import { IoCart, IoCartOutline } from "react-icons/io5"; // 카트 이모지 (react-icons/io5)

import styles from "./index.module.css";
import AuthButton from "../AuthBtn";
import { useShopHandler } from "@/Hook/BuyBtn/useBuyHandler";
import { Book } from "@/types/book";
import CartSuccessModal from "../../Modal/Arlam/AddToCartModal";
import { useModalStack } from "@/components/hook/useContextModal";

/**
 * 바로구매 버튼입니다. 장바구니에 추가 후 구매페이지로 이동하는 버튼입니다.
 *
 * @param {data} data -- Data를 구매에 추가합니다
 * @param {className} string -- className으로 전달해 줄 수 있습니다.
 */
export const BuyButton: React.FC<{
  data: Book;
  className?: string;
}> = ({ data, className }) => {
  // * 전역 : 로그인 체크 및 장바구니 토글 *
  const { openModal } = useModalStack();
  const { isInCart, toggleCart } = useShopHandler(data);

  const handleOpenShopAralm = () => {
    openModal("cart-modal", <CartSuccessModal data={data} />);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 부모 클릭(모달 오픈 등) 막기

    // 💡 현재 장바구니에 없는 상태일 때(즉, 새로 담을 때)만 모달 오픈
    if (!isInCart) {
      handleOpenShopAralm();
    }

    toggleCart();
  };

  return (
    <AuthButton className={clsx(styles.Like, className)} onClick={handleClick}>
      {isInCart ? <IoCart color="#fff" /> : <IoCartOutline />}
    </AuthButton>
  );
};
