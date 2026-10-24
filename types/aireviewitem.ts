export interface AiReviewItem {
  id: number;

  // AI 리뷰 데이터
  reviewer: string;
  personaName?: string;
  personaImage?: string;

  rating: number;
  Comment?: string;
  email?: string;
  Created?: string;

  // Persona 데이터
  imageSrc?: string;
  name?: string;
  roleTag?: string;

  user_id?: string;
  created_at?: string;

  datetime: Date;
}

export type ReviewerType =
  | "curator_silent"
  | "analyst_sharp"
  | "naruto_slugcat"
  | "relatable_stream"
  | "dreamer_cloud";
