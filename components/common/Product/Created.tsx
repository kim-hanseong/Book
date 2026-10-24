import { Skeleton } from "../Skeleton";

import { FormatRelativeTime } from "@/lib/utils/FormatTime";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { AiReviewItem } from "@/types/aireviewitem";
import { comment } from "@/types/comment";
import { Book } from "@/types/book";

export const Created: React.FC<{
  data: comment | AiReviewItem | Book;
  className: string;
}> = ({ data, className }) => {
  const { created_at } = data || {};
  const { lang } = useLanguage();

  const targetDate = created_at;

  if (!data || !created_at) {
    return <Skeleton className={className} />;
  }

  return (
    <span className={className}>{FormatRelativeTime(targetDate, lang)}</span>
  );
};
