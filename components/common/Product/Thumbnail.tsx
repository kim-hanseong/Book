import { Book } from "@/types/book";
import Image from "next/image";
import { Skeleton } from "../Skeleton";
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
}> = ({ data, w, h, className }) => {
  const { thumbnail, title } = data || {};
  const { lang } = useLanguage();

  if (!data || !thumbnail) {
    return <Skeleton w={w} h={h} className={className} />;
  }

  return (
    <Image
      className={className}
      alt={`${title || "도서"} ${altText[lang]}`}
      src={thumbnail}
      width={w}
      height={h}
      priority
    />
  );
};
