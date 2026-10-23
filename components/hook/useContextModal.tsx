"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

interface ModalItem {
  id: string;
  content: React.ReactNode;
  isClosing?: boolean;
}

interface ModalContextType {
  openModal: (id: string, content: React.ReactNode) => void;
  closeModal: () => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalStack, setModalStack] = useState<ModalItem[]>([]);

  const openModal = useCallback((id: string, content: React.ReactNode) => {
    setModalStack((prev) => [
      ...prev,
      {
        id,
        content,
        isClosing: false,
      },
    ]);
  }, []);

  const closeModal = useCallback(() => {
    setModalStack((prev) => {
      if (prev.length === 0) return prev;

      const updated = [...prev];
      const lastIndex = updated.length - 1;

      updated[lastIndex] = {
        ...updated[lastIndex],
        isClosing: true,
      };

      return updated;
    });

    setTimeout(() => {
      setModalStack((prev) => prev.slice(0, -1));
    }, 200);
  }, []);

  const closeAllModals = useCallback(() => {
    setModalStack((prev) =>
      prev.map((item) => ({
        ...item,
        isClosing: true,
      })),
    );

    setTimeout(() => {
      setModalStack([]);
    }, 200);
  }, []);

  /**
   * 모달이 하나라도 열려 있으면
   * 외부 페이지(body)의 스크롤을 잠근다.
   */
  useEffect(() => {
    if (modalStack.length === 0) return;

    const body = document.body;

    // 기존 body overflow 저장
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // 스크롤바가 사라지면서 layout이 움직이는 것 방지
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [modalStack.length]);

  /**
   * ESC → 가장 위에 있는 모달만 닫기
   */
  useEffect(() => {
    if (modalStack.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalStack.length, closeModal]);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        closeAllModals,
      }}
    >
      {children}

      {typeof window !== "undefined" &&
        modalStack.map((modal, index) =>
          createPortal(
            <div
              key={modal.id}
              role="presentation"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000 + index * 10,

                backgroundColor: "rgba(0, 0, 0, 0.5)",

                display: "flex",
                justifyContent: "center",

                opacity: modal.isClosing ? 0 : 1,

                transition: "opacity 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",

                /**
                 * overlay 자체는 스크롤하지 않는다.
                 */
                overflow: "hidden",

                /**
                 * 모달 외부에서 발생하는 터치/스크롤이
                 * 페이지로 전달되는 것을 방지
                 */
                overscrollBehavior: "contain",

                /**
                 * 모바일에서 body scroll chaining 방지
                 */
                touchAction: "none",
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  closeModal();
                }
              }}
              onWheel={(e) => {
                /**
                 * overlay에서 발생한 wheel 이벤트가
                 * 외부 페이지로 넘어가지 않게 한다.
                 */
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                }
              }}
            >
              <div
                data-closing={modal.isClosing}
                style={{
                  /**
                   * contents wrapper는 layout에 관여하지 않음
                   */
                  display: "contents",
                }}
              >
                {modal.content}
              </div>
            </div>,
            document.body,
          ),
        )}
    </ModalContext.Provider>
  );
}

export const useModalStack = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalStack must be used within ModalProvider");
  }

  return context;
};
