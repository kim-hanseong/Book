import classNames from "classnames";
import { Book } from "@/types/book";
import { Skeleton } from "../Skeleton";

export const Price: React.FC<{
  data: Book | null;
  className: string;
  quantity?: number;
}> = ({ data, className, quantity = 1 }) => {
  const { price } = data || {};

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat().format(number);
  };

  if (!data || !price) {
    return <Skeleton className={className} />;
  }

  return (
    <span className={classNames(className)}>
      {formatNumber(price * quantity)}
    </span>
  );
};
