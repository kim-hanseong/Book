"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Skeleton } from "../../Skeleton";
import { CloseButton } from "../../button/CloseBtn";
import { DeleteButton } from "../../button/DeleteBtn";

import styles from "./index.module.css";

import {
  deleteAddress,
  getAddressList,
  updateDefaultAddress,
} from "@/lib/api/addressAction";
import { Address } from "@/types/address";
import { useModalStack } from "@/components/hook/useContextModal";
import { queryKeys } from "@/lib/query/querykeys";
import { ADDRESS_LIST_DICTIONARY } from "@/constants/common/Modal/AddressListModal/addressListModal";
import { useLanguage } from "@/components/hook/useContextLanguge";

export interface AddressItem {
  id: number | string;
  recipient_name: string;
  phone_number: string;
  addressinfo: string;
  addressdetailinfo: string;
  is_default: boolean;
}

export default function AddressListModal() {
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ADDRESS_LIST_DICTIONARY[lang];

  // 주소 목록 조회
  const { data: historyList = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: queryKeys.address.list(),
    queryFn: async () => {
      const postData = await getAddressList();

      return (postData ?? []) as Address[];
    },
    staleTime: 1000 * 60 * 3, // 3분 캐싱
  });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{t.title}</h3>
          <CloseButton onClick={closeModal} />
        </div>
        {isHistoryLoading ? (
          <ReadAddressSLoading />
        ) : (
          <ReadAddressSection address={historyList} />
        )}
      </div>
    </div>
  );
}

const ReadAddressSection = React.memo(function ReadAddressSection({
  address = [],
}: {
  address: Address[];
}) {
  const queryClient = useQueryClient();
  const { closeModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ADDRESS_LIST_DICTIONARY[lang];

  // 💡 데이터 타입 안전성 보장 (배열이 아닐 경우 빈 배열 처리)
  const safeAddress = useMemo(() => {
    return Array.isArray(address) ? address : [];
  }, [address]);

  const defaultAddressId = useMemo(() => {
    return (
      safeAddress.find((item) => item.is_default)?.id ||
      safeAddress[0]?.id ||
      null
    );
  }, [safeAddress]);

  const [selectedId, setSelectedId] = useState<string | number | null>(
    defaultAddressId,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorId, setDeleteErrorId] = useState<string | number | null>(
    null,
  );

  // 기본 배송지 변경
  const handleApplyDefaultAddress = useCallback(async () => {
    if (!selectedId) return;

    const selectedItem = safeAddress.find((item) => item.id === selectedId);

    if (selectedItem && !selectedItem.is_default) {
      setIsLoading(true);
      const success = await updateDefaultAddress(String(selectedId));

      setIsLoading(false);
      closeModal();

      if (success) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.address.list(),
        });
      }
    }
  }, [selectedId, safeAddress, closeModal, queryClient]);

  // 주소 삭제
  const handleDeleteAddress = useCallback(
    async (id: string, isDefault: boolean) => {
      if (isDefault) {
        setDeleteErrorId(id);

        return;
      }

      setDeleteErrorId(null);
      if (isDeleting) return;

      try {
        setIsDeleting(true);
        const success = await deleteAddress(id);

        if (success) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.address.list(),
          });
        }
      } catch (error) {
        console.error("주소 삭제 중 에러 발생:", error);
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting, queryClient],
  );

  const handleSelectAddress = useCallback((id: string | number) => {
    setSelectedId(id);
    setDeleteErrorId(null);
  }, []);

  return (
    <div className={styles.steps}>
      <div className={styles.modalBody}>
        {safeAddress.map((item) => (
          <AddressCard
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={handleSelectAddress}
            onDelete={handleDeleteAddress}
            t={t}
          />
        ))}
      </div>

      <div className={styles.amActions} style={{ marginTop: "20px" }}>
        {deleteErrorId && (
          <span className={styles.errorMessage}>{t.cannotDeleteDefault}</span>
        )}
        <button
          type="button"
          className={`${styles.pearlTake} ${styles.primary}`}
          disabled={isLoading}
          onClick={handleApplyDefaultAddress}
        >
          {isLoading ? t.changing : t.applyButton}
        </button>
      </div>
    </div>
  );
});

/* ==========================================================================
   SUB COMPONENTS (React.memo 적용)
   ========================================================================== */

interface AddressCardProps {
  item: Address;
  isSelected: boolean;
  onSelect: (id: string | number) => void;
  onDelete: (id: string, isDefault: boolean) => void;
  t: (typeof ADDRESS_LIST_DICTIONARY)["ko"];
}

const AddressCard = React.memo(function AddressCard({
  item,
  isSelected,
  onSelect,
  onDelete,
  t,
}: AddressCardProps) {
  return (
    <div
      className={`${styles.amItem} ${isSelected ? styles.checked : ""}`}
      style={{ position: "relative" }}
    >
      <button
        type="button"
        className={styles.amItemSelect}
        onClick={() => onSelect(item.id)}
      >
        <span className={styles.amBox} />

        <div className={styles.amItemBody}>
          <div className={styles.amItemTop}>
            <span className={styles.amName}>{item.recipient_name}</span>
            {item.is_default && (
              <span className={styles.ssBadge}>{t.defaultBadge}</span>
            )}
          </div>
          <div className={styles.amPhone}>{item.phone_number}</div>
          <div className={styles.amAddr}>
            {item.addressinfo}
            <br />
            {item.addressdetailinfo}
          </div>
        </div>
      </button>

      <DeleteButton
        onClick={() => onDelete(String(item.id), item.is_default)}
      />
    </div>
  );
});

const ReadAddressSLoading = React.memo(function ReadAddressSLoading() {
  return (
    <div className={styles.steps}>
      {[1, 2, 3].map((item) => (
        <div key={item} className={styles.amItem}>
          <Skeleton className={styles.sk} />
        </div>
      ))}
    </div>
  );
});
