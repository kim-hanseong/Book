export interface FooterLink {
  href: string;
  label: string;
}

export const FOOTER_DICTIONARY = {
  ko: {
    brandName: "THE ARCHIVE",
    tagline: "모든 펄은 안전하게 보관됩니다.",
    links: [
      { href: "#guide", label: "이용 안내" },
      { href: "#shipping", label: "배송 정책" },
      { href: "#refund", label: "환불 규정" },
      { href: "#contact", label: "문의" },
    ],
  },
  en: {
    brandName: "THE ARCHIVE",
    tagline: "All pearls are safely archived.",
    links: [
      { href: "#guide", label: "Guide" },
      { href: "#shipping", label: "Shipping Policy" },
      { href: "#refund", label: "Refund Policy" },
      { href: "#contact", label: "Contact" },
    ],
  },
} as const;
