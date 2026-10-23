export const SHOP_MODAL_DICTIONARY = {
  ko: {
    title: "보관함",
    emptyTitle: "보관함이 비어있어요",
    emptyDescription: "마음에 드는 책을 담아보세요.",
    closeButton: "보관함 닫기",
    deleteButton: "상품 삭제",
    purchaseButton: "구매하러 가기",
  },

  en: {
    title: "My Collection",
    emptyTitle: "Your collection is empty",
    emptyDescription: "Add books you like to your collection.",
    closeButton: "Close collection",
    deleteButton: "Remove item",
    purchaseButton: "Proceed to Purchase",
  },
} as const;

export type ShopModalDictionary = typeof SHOP_MODAL_DICTIONARY;
