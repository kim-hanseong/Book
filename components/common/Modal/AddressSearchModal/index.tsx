"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useQuery } from "@tanstack/react-query";

import { CloseButton } from "../../button/CloseBtn";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { KakaoAddress } from "@/lib/kakao/addressApi";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { ADDRESS_SEARCH_DICTIONARY } from "@/constants/common/Modal/AddressSearchModal/addressSearchModal";
import { Address } from "@/types/address";

export default function AddressSearchModal({
  onChangeAddress,
}: {
  onChangeAddress: (address: string) => void;
}) {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ADDRESS_SEARCH_DICTIONARY[lang];

  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 1. 디바운싱 적용 (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // 2. TanStack Query 검색
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["kakaoAddress", debouncedQuery],
    queryFn: () => KakaoAddress(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 💡 깨졌던 연산자 복구
    gcTime: 1000 * 60 * 10, // 💡 깨졌던 연산자 복구
  });

  const handleChipClick = (keyword: string) => {
    setInputValue(keyword);
  };

  const handleAddress = (info: string) => {
    onChangeAddress(info);
    closeModal();
  };

  return (
    <div className={clsx(styles.modalOverlay, styles.searchOverlay)}>
      <div className={clsx(styles.addrModal, styles.searchModal)}>
        <CloseButton onClick={closeModal} className={styles.amClose} />

        <div className={styles.amHead}>
          <div className={styles.amEyebrow}>{t.eyebrow}</div>
          <div className={styles.amTitle}>{t.title}</div>
        </div>

        <div className={styles.smSearch}>
          <svg viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <line x1="15.5" y1="15.5" x2="21" y2="21" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.placeholder}
            autoComplete="off"
          />
        </div>

        <div className={styles.smBody}>
          {debouncedQuery.length < 2 ? (
            <div className={styles.smHint}>
              <div className={styles.smHintTitle}>{t.hintTitle}</div>
              <div className={styles.smHintLines}>
                {t.hintRoadLabel} <span>{t.hintRoadEx}</span>
                <br />
                {t.hintLotLabel} <span>{t.hintLotEx}</span>
                <br />
                {t.hintBuildingLabel} <span>{t.hintBuildingEx}</span>
              </div>
              <div className={styles.smChips}>
                {t.chips.map((chip, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={styles.smChip}
                    onClick={() => handleChipClick(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.smResultWrap}>
              <div className={styles.amCount}>
                {isLoading ? t.searching : t.resultCount(searchResults.length)}
              </div>
              <div className={styles.smResults}>
                {searchResults.map((item: Address, idx: number) => (
                  <div key={idx} className={styles.addressItem}>
                    <button
                      className={styles.itemBody}
                      onClick={() => {
                        handleAddress(item.address_name);
                      }}
                    >
                      <div className={styles.itemName}>{item.address_name}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
