export type Book = {
  delivery?: boolean;
  rating: number;
  id?: number;
  title: string;
  price: number;
  sale_price: number;
  authors: string[]; // 여기서 authors가 문자열 배열인지 확인합니다.
  thumbnail: string;
  publisher: string;
  contents: string;
  datetime: Date;
  created_at?: Date;
  numbering?: number;
  isbn: string;
  content: string;
  blurDataURL?: string;
};
