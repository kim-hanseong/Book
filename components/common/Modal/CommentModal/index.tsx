import { useState } from "react";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

import { CloseButton } from "../../button/CloseBtn";
import { Title } from "../../Product/Title";
import { Thumbnail } from "../../Product/Thumbnail";
import KarmaRating from "../../Rating";
import CommentSuccessModal from "../Arlam/Comment/SuccessArlam";
import ErrorModal from "../GlobalModal/ErrorModal";
import LoadingModal from "../GlobalModal/LadingAralm";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { Book } from "@/types/book";
import { REVIEW_MODAL_DICTIONARY } from "@/constants/common/Modal/CommentModal/commentModal";
import { AddPost } from "@/lib/api/postAction";
import { AddRating } from "@/lib/api/ratingAction";

export interface ReviewModalProps {
  data: Book;
  maxLength?: number;
  minTextLength?: number;
}

/* ------------------ 메인 모달 컴포넌트 ------------------ */

export const ReviewModal: React.FC<ReviewModalProps> = ({
  data,
  maxLength = 500,
  minTextLength = 10,
}) => {
  const { closeModal } = useModalStack();

  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient(); // 2. queryClient 인스턴스 생성
  const isValid = rating > 0 && text.trim().length >= minTextLength;
  const { openModal } = useModalStack();

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      openModal("loading", <LoadingModal />);

      const { error } = await AddPost(data, text, rating);

      await AddRating(data, rating);

      // 🎯 에러 로그 확인
      if (error) {
        openModal("loading", <ErrorModal />);
      }
      closeModal(); // 👈 삭제 버튼을 누르는 순간 확인 모달 즉시 닫기

      await queryClient.invalidateQueries({
        queryKey: ["user-comments", data?.title, data.isbn],
      });
      openModal("commentSuccess", <CommentSuccessModal />);
    } catch (err) {
      console.error("예외 발생:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalContainer}>
      <div className={styles.reviewCard}>
        <CloseButton onClick={closeModal} />

        <ReviewBookHeader data={data} />

        <RatingInput rating={rating} setRating={setRating} />

        <ReviewTextArea text={text} setText={setText} maxLength={maxLength} />

        <ReviewSubmitFooter disabled={!isValid} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

/* ------------------ 도서 정보 ------------------ */

function ReviewBookHeader({ data }: { data: Book }) {
  return (
    <div className={styles.targetbook}>
      <div className={styles.modalCover}>
        <Thumbnail data={data} className={styles.thumbnail} w={52} h={52} />
      </div>
      <div className={styles.tbInfo}>
        <Title data={data} className={styles.title} />
      </div>
    </div>
  );
}

/* ------------------ Rating ------------------ */

function RatingInput({
  rating,
  setRating,
}: {
  rating: number;
  setRating: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { lang } = useLanguage();
  const t = REVIEW_MODAL_DICTIONARY[lang || "ko"];

  // 소수점 점수 대응 (예: 4.2 -> 4번 인덱스 캡션 매핑)
  const currentCaptionIndex = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div className={styles.ratingFieldContainer}>
      <label className={styles.fieldLabel}>{t.ratingQuestion}</label>

      <div className={styles.ratingInputRow}>
        <KarmaRating
          readOnly={false}
          rating={rating}
          onChange={(score) => {
            setRating(score);
          }}
          size={60}
        />

        <div className={styles.segRingWrap}>
          <span className={styles.captionText}>
            {t.ratingCaptions?.[currentCaptionIndex] || `${rating}점`}
          </span>
          <span className={styles.hint}>{t.ratingHint}</span>
        </div>
      </div>
    </div>
  );
}
/* ------------------ Review Text ------------------ */

function ReviewTextArea({
  text,
  setText,
  maxLength,
}: {
  text: string;
  setText: (text: string) => void;
  maxLength: number;
}) {
  const { lang } = useLanguage();

  const t = REVIEW_MODAL_DICTIONARY[lang || "ko"];

  return (
    <div className={styles.fieldBlock}>
      <div className={styles.fieldLabel}>{t.reviewLabel}</div>

      <div className={styles.textBox}>
        <textarea
          maxLength={maxLength}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.reviewPlaceholder}
        />
      </div>

      <div
        className={clsx(
          styles.charCount,
          text.length > maxLength - 50 && styles.nearLimit,
        )}
      >
        {text.length} / {maxLength}
      </div>
    </div>
  );
}

/* ------------------ Submit ------------------ */

function ReviewSubmitFooter({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: () => void;
}) {
  const { lang } = useLanguage();

  const t = REVIEW_MODAL_DICTIONARY[lang || "ko"];

  return (
    <>
      <div className={styles.submitNote}>
        <span className="dot" />
        {t.publicNote}
      </div>

      <button
        type="button"
        className={styles.submitBtn}
        disabled={disabled}
        onClick={onSubmit}
      >
        {t.submitButton}
      </button>
    </>
  );
}
//
