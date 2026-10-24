import classNames from "classnames";

import { Skeleton } from "../Skeleton";

import { Book } from "@/types/book";
import { CommentItem } from "@/components/page/mypage";

export const Title: React.FC<{
  data: Book | CommentItem | null;
  className: string;
}> = ({ data, className }) => {
  const { title } = data || {};

  if (!data || !title) {
    return <Skeleton className={className} />;
  }

  return <h3 className={classNames(className, "hover:underline")}>{title}</h3>;
};
