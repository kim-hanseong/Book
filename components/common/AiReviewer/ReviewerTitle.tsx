import classNames from "classnames";

import { Skeleton } from "../Skeleton";

import { PersonaItem } from "@/constants/main/AiReviewSelect";

export const AiTitle: React.FC<{
  data?: PersonaItem | null;
  className: string;
}> = ({ data, className }) => {
  const { name } = data || {};

  if (!data || !name) {
    return <Skeleton className={className} />;
  }

  return <p className={classNames(className, "hover:underline")}>{name}</p>;
};
