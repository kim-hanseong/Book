export const ERROR_MODAL_DICTIONARY = {
  ko: {
    closeLabel: "닫기",
    retryBtn: "다시 시도",
    dismissBtn: "닫기",
    eyebrow: "— 지층이 흔들렸습니다 —",
    defaultTitle: "무언가 어긋났습니다",
    defaultDesc: "요청을 처리하는 도중 연결이 끊겼어요. 다시 시도해보시겠어요?",
    defaultCode: "ERR · CONNECTION",
  },
  en: {
    closeLabel: "Close",
    retryBtn: "RETRY",
    dismissBtn: "DISMISS",
    eyebrow: "— THE STRATUM SHHOOK —",
    defaultTitle: "Something went wrong",
    defaultDesc:
      "Connection was lost while processing your request. Would you like to try again?",
    defaultCode: "ERR · CONNECTION",
  },
} as const;
