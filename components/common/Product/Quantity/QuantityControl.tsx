import styles from "./index.module.css";

interface QuantityControlProps {
  itemId?: string | number;
  quantities: Record<string, number>;
  onQuantityChange: (id: string, newQty: number) => void;
}

export default function QuantityControl({
  itemId,
  quantities,
  onQuantityChange,
}: QuantityControlProps) {
  // 💡 itemId가 undefined일 경우를 대비해 안전하게 문자열로 변환
  const stringId = itemId !== undefined ? String(itemId) : "";

  // 현재 아이템의 수량을 객체에서 가져옴 (없거나 id가 없으면 기본값 1)
  const currentQty = stringId ? quantities[stringId] || 1 : 1;

  const handleDecrease = () => {
    if (!stringId || currentQty <= 1) return;
    onQuantityChange(stringId, currentQty - 1); // 💡 - 연산자 누락 수정
  };

  const handleIncrease = () => {
    if (!stringId) return;
    onQuantityChange(stringId, currentQty + 1);
  };

  return (
    <div className={styles.modalRow}>
      <div className={styles.modalQty}>
        <button type="button" onClick={handleDecrease}>
          -
        </button>

        <span>{currentQty}</span>

        <button type="button" onClick={handleIncrease}>
          +
        </button>
      </div>
    </div>
  );
}
