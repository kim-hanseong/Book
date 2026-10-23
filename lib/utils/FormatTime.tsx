// src/utils/formatTime.ts

export function FormatRelativeTime(
  dateString?: string,
  lang: string = "ko",
): string {
  if (!dateString) return "";

  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (isNaN(past.getTime()) || diffInSeconds < 0) {
    return dateString;
  }

  const isKo = lang === "ko";

  if (diffInSeconds < 60) {
    return isKo ? "방금 전" : "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return isKo ? `${diffInMinutes}분 전` : `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return isKo ? `${diffInHours}시간 전` : `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return isKo ? `${diffInDays}일 전` : `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return isKo ? `${diffInMonths}달 전` : `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return isKo ? `${diffInYears}년 전` : `${diffInYears}y ago`;
}
