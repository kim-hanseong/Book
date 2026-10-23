import Image from "next/image";
import { Skeleton } from "../Skeleton";
import { useLanguage } from "@/components/hook/useContextLanguge";

const altText = {
  ko: "리뷰캐릭터 이미지",
  en: "Review Ai image",
} as const;

export const AiThumbnail: React.FC<{
  src?: string | null;
  w?: number;
  h?: number;
  className?: string;
}> = ({ src, w, h, className }) => {
  const { lang } = useLanguage();

  if (!src) {
    return <Skeleton w={w} h={h} className={className} />;
  }

  return (
    <Image
      className={className}
      alt={`${name} ${altText[lang]}`}
      src={src}
      width={w}
      height={h}
      priority
    />
  );
};
