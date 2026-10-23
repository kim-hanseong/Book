import { Skeleton } from "../Skeleton";

import { Book } from "@/types/book";

export const Authors: React.FC<{
  data: Book | null;
  className: string;
}> = ({ data, className }) => {
  const { authors } = data || {};

  if (!data || !authors) {
    return <Skeleton className={className} />;
  }

  const authorText = Array.isArray(authors) ? authors.join(", ") : authors;

  return authors.length === 0 ? null : (
    <span className={className}>{authorText}</span>
  );
};
