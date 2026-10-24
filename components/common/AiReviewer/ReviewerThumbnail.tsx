import Image from "next/image";

import { Skeleton } from "../Skeleton";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { AiReviewItem } from "@/types/aireviewitem";
import { PersonaItem } from "@/constants/main/AiReviewSelect";

const altText = {
  ko: "리뷰캐릭터 이미지",
  en: "Review Ai image",
} as const;

export const AiThumbnail: React.FC<{
  data?: AiReviewItem | PersonaItem | null;
  w?: number;
  h?: number;
  className?: string;
}> = ({ data, w, h, className }) => {
  const { lang } = useLanguage();

  // 💡 src가 아니라 data.imageSrc가 없는지 확인해야 합니다!
  if (!data?.imageSrc) {
    return <Skeleton w={w} h={h} className={className} />;
  }

  return (
    <Image
      className={className}
      alt={`${data.name} ${altText[lang]}`}
      src={data.imageSrc}
      width={w}
      height={h}
      priority
    />
  );
};
