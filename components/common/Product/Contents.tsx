import { Book } from "@/types/book";

export const Contents: React.FC<{
  data: Book | null;
  className: string;
}> = ({ data, className }) => {
  const { contents } = data || {};

  if (!data || !contents) {
    return <p className={className}>-</p>;
  }

  return <p className={className}>{contents}</p>;
};
