import classNames from "classnames";
import { Book } from "@/types/book";
import { Skeleton } from "../Skeleton";
import { FormatRelativeTime } from "@/lib/utils/FormatTime";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { AiReviewItem } from "@/types/aireviewitem";
import { comment } from "@/types/comment";

export const Created: React.FC<{
  data: comment | AiReviewItem;
  className: string;
}> = ({ data, className }) => {
  const { created_at, date } = data || {};
  const { lang } = useLanguage();

  const targetDate = date || created_at;

  if (!data || !created_at) {
    return <Skeleton className={className} />;
  }

  return (
    <span className={className}>{FormatRelativeTime(targetDate, lang)}</span>
  );
};
