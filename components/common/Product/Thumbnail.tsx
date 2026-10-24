import Image from "next/image";

import { Skeleton } from "../Skeleton";

import { Book } from "@/types/book";
import { useLanguage } from "@/components/hook/useContextLanguge";

const altText = {
  ko: "도서 표지 이미지",
  en: "Book cover image",
} as const;

export const Thumbnail: React.FC<{
  data: Book | null;
  w?: number;
  h?: number;
  className?: string;
  priority?: boolean;
}> = ({ data, w, h, className, priority = false }) => {
  const { thumbnail, title } = data || {};
  const { lang } = useLanguage();

  if (!data || !thumbnail) {
    return <Skeleton w={w} h={h} className={className} />;
  }

  // w, h가 있으면 고정 크기 방식, 없으면 부모를 채우는 fill 방식
  return (
    <Image
      className={className}
      alt={`${title || "도서"} ${altText[lang]}`}
      src={thumbnail}
      {...(w && h ? { width: w, height: h } : { fill: true })}
      priority={priority}
      style={{ objectFit: "cover", width: "100%", height: "100%" }}
    />
  );
};
