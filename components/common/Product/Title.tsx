import classNames from "classnames";

import { Skeleton } from "../Skeleton";

import { Book } from "@/types/book";

export const Title: React.FC<{
  data: Book | null;
  className: string;
}> = ({ data, className }) => {
  const { title } = data || {};

  if (!data || !title) {
    return <Skeleton className={className} />;
  }

  return <h3 className={classNames(className, "hover:underline")}>{title}</h3>;
};
