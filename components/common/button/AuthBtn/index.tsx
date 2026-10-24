"use client";

import AuthModal from "../../Modal/GlobalModal/LoginModal";

import { useSupabase } from "@/components/Auth/AuthProvider";
import { useModalStack } from "@/components/hook/useContextModal";
import { ButtonProps } from "@/types/btn";

interface AuthButtonProps extends ButtonProps {
  authMode?: "login-only" | "protected";
  className?: string; // className 추가
}

export default function AuthButton({
  onClick,
  children,
  className, // className 받기
  ...buttonProps
}: AuthButtonProps) {
  const { session } = useSupabase();
  const { openModal } = useModalStack();

  const handleAuthClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!session) {
      e.preventDefault();
      openModal("auth-modal", <AuthModal />);
    } else {
      onClick?.(e);
    }
  };

  return (
    <button {...buttonProps} className={className} onClick={handleAuthClick}>
      {children}
    </button>
  );
}
