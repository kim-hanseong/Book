export interface comment {
  id: string | number;

  rating: number;
  Comment?: string;
  email?: string;
  created_at?: string;
  user_id: string; // currentUserId(Supabase user.id)와 비교하는 회원 ID
}

export type ReviewerType =
  | "curator_silent"
  | "analyst_sharp"
  | "naruto_slugcat"
  | "relatable_stream"
  | "dreamer_cloud";

const reviewerColumns: ReviewerType[] = [
  "curator_silent",
  "analyst_sharp",
  "naruto_slugcat",
  "relatable_stream",
  "dreamer_cloud",
];
