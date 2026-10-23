import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import useOutsideClickHandler from "@/Hook/common/useModalOutSideRef";

// --- 1. Context 타입 정의 ---
interface SelectGroupContextType {
  clickedSelect: string | null;
  hoveredSelect: string | null;
  handleSelectClick: (name: string) => void;
  handleSelectHover: (name: string) => void;
}

// --- 2. Context 생성 ---
// Provider가 없을 경우를 대비해 기본값은 null로 설정
const SelectGroupContext = createContext<SelectGroupContextType | null>(null);

// --- 3. Provider 컴포넌트 생성 ---
interface SelectGroupProviderProps {
  children: ReactNode;
}

export const SelectGroupProvider: React.FC<SelectGroupProviderProps> = ({
  children,
}) => {
  // 우리가 설계한 두 개의 상태
  const [clickedSelect, setClickedSelect] = useState<string | null>(null);
  const [hoveredSelect, setHoveredSelect] = useState<string | null>(null);

  // 외부 클릭 및 마우스 이탈 처리를 위한 로직
  const isGroupOpen = clickedSelect !== null;

  const closeGroup = useCallback(() => {
    setClickedSelect(null);
    setHoveredSelect(null);
  }, []);

  // useOutsideClickHandler는 첫번째 인자로 boolean, 두번째 인자로 setter를 받습니다.
  // isGroupOpen이 true일 때만 외부 클릭/Esc 입력을 감지하고, 이벤트 발생 시 closeGroup을 실행합니다.
  // 훅은 감지할 영역의 ref를 반환합니다.
  const wrapperRef = useOutsideClickHandler(isGroupOpen, closeGroup);

  const handleMouseLeave = useCallback(() => {
    // 만약 마지막으로 호버했던 Select가 있다면...
    if (hoveredSelect) {
      // 그 Select를 새로운 '클릭'된 Select로 확정합니다.
      setClickedSelect(hoveredSelect);
    }
    // 그리고 호버 상태는 초기화합니다.
    setHoveredSelect(null);
  }, [hoveredSelect, setClickedSelect]);

  // 클릭 핸들러 (useCallback으로 최적화)
  const handleSelectClick = useCallback((name: string) => {
    setClickedSelect((prev) => (prev === name ? null : name));
    setHoveredSelect(null);
  }, []);

  // 호버 핸들러 (useCallback으로 최적화)
  const handleSelectHover = useCallback(
    (name: string) => {
      if (clickedSelect) {
        setHoveredSelect(name);
      }
    },
    [clickedSelect]
  );

  // Context를 통해 제공할 값
  const value = {
    clickedSelect,
    hoveredSelect,
    handleSelectClick,
    handleSelectHover,
  };

  return (
    <SelectGroupContext.Provider value={value}>
      <div ref={wrapperRef} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
    </SelectGroupContext.Provider>
  );
};

// --- 4. Custom Hook 생성 ---
export const useSelectGroup = () => {
  const context = useContext(SelectGroupContext);

  if (!context) {
    throw new Error("useSelectGroup must be used within a SelectGroupProvider");
  }

  return context;
};
