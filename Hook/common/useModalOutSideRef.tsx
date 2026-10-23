import { useRouter } from "next/navigation";
import { useEffect, useRef, MutableRefObject } from "react";

//* Hook : Outside Ref ## *
function useOutsideClickHandler(
  isOpen: boolean,
  setIsOpen: (isOpen: boolean) => void,
  routePath: string = ""
): MutableRefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
      if (routePath) {
        router.push(routePath);
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      if (routePath) {
        router.push(routePath);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, routePath, router]);

  return ref;
}

export default useOutsideClickHandler;
