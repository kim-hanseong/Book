import styles from "./index.module.css";

interface QuantityControlProps {
  itemId?: string | number; // 💡 undefined 방어를 위해 optional 또는 union 타입 적용
  quantities: Record<string, number>;
  onQuantityChange: (id: string, newQty: number) => void;
}

export default function QuantityControl({
  itemId,
  quantities,
  onQuantityChange,
}: QuantityControlProps) {
  // 현재 아이템의 수량을 객체에서 가져옴 (없으면 기본값 1)
  const currentQty = quantities[itemId] || 1;

  const handleDecrease = () => {
    if (currentQty <= 1) return;
    onQuantityChange(itemId, currentQty - 1);
  };

  const handleIncrease = () => {
    onQuantityChange(itemId, currentQty + 1);
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
