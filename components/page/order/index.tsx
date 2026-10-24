"use client";

import React, {
  useState,
  MouseEvent,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import styles from "./index.module.css";

import {
  ORDER_DICTIONARY,
  SHOP_EMPTY_DICTIONARY,
} from "@/constants/order/order";
import { Book } from "@/types/book";
import { Address } from "@/types/address";
import { AddAddressDataBase, getAddressList } from "@/lib/api/addressAction";
import { useToggleShopMutation } from "@/Hook/BuyBtn/useToggleBuyMutation";
import { queryKeys } from "@/lib/query/querykeys";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";
import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import AddressSearchModal from "@/components/common/Modal/AddressSearchModal";
import AddressListModal from "@/components/common/Modal/AddressListModal";
import AddressDoneModal from "@/components/common/Modal/Arlam/AddAddressArlam";
import { DeleteButton } from "@/components/common/button/DeleteBtn";
import { Thumbnail } from "@/components/common/Product/Thumbnail";
import { Title } from "@/components/common/Product/Title";
import { Authors } from "@/components/common/Product/Authors";
import QuantityControl from "@/components/common/Product/Quantity/QuantityControl";
import { AddOrder } from "@/lib/api/orderAction";
import { removeFromCartApi } from "@/lib/api/shopAction";
import OrderSuccessModal from "@/components/common/Modal/Arlam/Order/Success";
import ErrorModal from "@/components/common/Modal/GlobalModal/ErrorModal";
import LoadingModal from "@/components/common/Modal/GlobalModal/LadingAralm";

export type PayMethod = "card" | "bank" | "easy";

interface OrderPageProps {
  shop: Book[];
  address: Address[];
}

export default function OrderPage({ shop, address }: OrderPageProps) {
  const { openModal } = useModalStack();
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  // 1. React Query (staleTime 적용으로 불필요한 재요청 방지)
  const { data: shopList = [], isLoading: isShopLoading } = useQuery<Book[]>({
    queryKey: queryKeys.cart.list(),
    queryFn: fetchBuyList,
    initialData: shop,
    staleTime: 1000 * 60 * 5,
  });

  const { data: addressList = [] } = useQuery({
    queryKey: queryKeys.address.list(),
    queryFn: async (): Promise<Address[]> => {
      const postData = await getAddressList();

      return (postData ?? []) as Address[];
    },
    initialData: address,
    staleTime: 1000 * 60 * 5,
  });

  const isCheckoutDisabled = (
    shopList: Book[] | undefined,
    addressList: Address[] | undefined,
    isSubmitting: boolean, // <- 로딩 상태 인자 추가
  ): boolean => {
    return (
      isSubmitting || // <- 로딩 중이면 무조건 비활성화!
      !shopList ||
      shopList.length === 0 ||
      !addressList ||
      addressList.length === 0
    );
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용할 때 isSubmitting 전달
  const isDisabled = isCheckoutDisabled(shopList, addressList, isSubmitting);
  // 2. Component States (shop이 undefined일 경우 대비 안전장치 추가)
  const [addressInfo, setAddressInfo] = useState<string>("");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [isAgreed, setIsAgreed] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};

    (shop || []).forEach((item) => {
      // item.id가 존재할 때만 객체에 추가
      if (item.id != null) {
        initial[String(item.id)] = item.numbering || 1;
      }
    });

    return initial;
  });

  // 3. Derived States (메모이제이션 적용)
  const isEmpty = shopList.length === 0;
  const hasBothData = useMemo(
    () => shopList.length > 0 && addressList.length > 0,
    [shopList.length, addressList.length],
  );

  const totalPrice = useMemo(() => {
    return shopList.reduce((sum, item) => {
      // item.id가 없으면 이번 아이템은 계산에서 제외
      if (item.id == null) return sum;

      const currentQty = quantities[item.id] || 1;
      return sum + (item.price || 0) * currentQty;
    }, 0);
  }, [shopList, quantities]);

  // 4. Handlers (메모이제이션 적용)
  const handleQuantityChange = useCallback((id: string, newQty: number) => {
    if (newQty < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [id]: newQty,
    }));
  }, []);

  const handleOpenAddressSearchModal = useCallback(() => {
    openModal(
      "address-search-modal",
      <AddressSearchModal onChangeAddress={setAddressInfo} />,
    );
  }, [openModal]);

  const handleOpenOrderhModal = useCallback(() => {
    openModal("address-order-modal", <OrderSuccessModal />);
  }, [openModal]);

  const handleOpenReviewModal = useCallback(() => {
    openModal("review-modal", <AddressListModal />);
  }, [openModal]);

  const queryClient = useQueryClient(); // 2. 쿼리 클라이언트 선언
  const { closeModal } = useModalStack();

  const handleCheckoutAll = async () => {
    setIsSubmitting(true); // 1. 결제 시작 시 로딩 상태 활성화 (버튼 잠금)
    openModal("loading", <LoadingModal />);

    try {
      const orderPromises = shopList.map(async (item) => {
        if (!item.id) {
          throw new Error("상품 ID가 존재하지 않습니다.");
        }
        const currentQty = quantities[item.id] || 1;
        const orderResult = await AddOrder(item, addressList[0], currentQty);

        if (!orderResult.error) {
          await removeFromCartApi(item);
        }

        return orderResult;
      });

      const results = await Promise.all(orderPromises);

      // 2. 모든 요청이 끝났으므로 로딩 모달 닫기
      closeModal();

      const failedResult = results.find((res) => res.error);

      if (failedResult) {
        openModal("error-modal", <ErrorModal />);

        return;
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.cart.list(),
      });

      handleOpenOrderhModal();
    } catch (error) {
      closeModal();
      openModal("error-modal", <ErrorModal />);
    } finally {
      // 3. 성공하든 실패하든 예외가 나든 무조건 로딩 해제 (버튼 풀기)
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div className={styles.eyebrow}>{t.eyebrow}</div>
        <div className={styles.pageTitle}>{t.pageTitle}</div>
      </div>
      <div className={styles.layout}>
        <div className={styles.steps}>
          <AddressSection
            address={addressList[0]}
            addressinfo={addressInfo}
            onModalOpen={handleOpenReviewModal}
            onSearchModal={handleOpenAddressSearchModal}
          />
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span className={styles.panelNo}>{t.step2No}</span>
              <span className={styles.panelTitle}>{t.step1Title}</span>
            </div>
            {isEmpty ? (
              <EmptyShop />
            ) : isShopLoading ? (
              <ShopLoadingList />
            ) : (
              <ShopList
                item={shopList}
                quantities={quantities}
                onQuantityChange={handleQuantityChange}
              />
            )}
            <PaymentSection payMethod={payMethod} setPayMethod={setPayMethod} />
          </div>
        </div>
        <OrderSummarySection
          total={totalPrice}
          isAgreed={isAgreed}
          setIsAgreed={setIsAgreed}
          hasBothData={hasBothData}
          handlePayClick={handleCheckoutAll}
          disable={isDisabled}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   SUB COMPONENTS
   ========================================================================== */

function AddressSection({
  address,
  addressinfo,
  onModalOpen,
  onSearchModal,
}: {
  address: Address | null;
  addressinfo: string;
  onModalOpen: () => void;
  onSearchModal: () => void;
}) {
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];
  const [isAdding, setIsAdding] = useState(false);

  // 💡 새 주소 입력 폼 상태
  const [newAddress, setNewAddress] = useState({
    address_name: "",
    addressinfo: "",
    addressdetailinfo: "",
    recipient_name: "",
    phone_number: "",
  });

  // 💡 에러 상태 및 에러 메시지
  const [errors, setErrors] = useState({
    recipient_name: false,
    phone_number: false,
    addressdetailinfo: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    recipient_name: "",
    phone_number: "",
    addressdetailinfo: "",
  });

  const [shakeField, setShakeField] = useState<string | null>(null);

  // 💡 Ref 연결
  const recipientRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { openModal } = useModalStack();

  // 검색 주소 동기화
  useEffect(() => {
    if (addressinfo) {
      setNewAddress((prev) => ({ ...prev, addressinfo }));
    }
  }, [addressinfo]);

  const triggerShake = (fieldName: string) => {
    setShakeField(null);
    setTimeout(() => setShakeField(fieldName), 10);
  };

  const validatePhone = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "");

    return /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/.test(cleaned);
  };

  const hasIncompleteJamo = (text: string) => {
    return /[ㄱ-ㅎ]$/.test(text.trim());
  };
  const queryClient = useQueryClient(); // 💡 쿼리 클라이언트 인스턴스 생성

  // 💡 주소 저장 및 유효성 검사 처리
  const handleSaveAddress = async () => {
    setIsSubmitting(true);
    // 1. 수령인 검증
    if (!newAddress.recipient_name.trim()) {
      setErrors({
        recipient_name: true,
        phone_number: false,
        addressdetailinfo: false,
      });
      setErrorMessages({
        recipient_name: t.errors.recipientRequired,
        phone_number: "",
        addressdetailinfo: "",
      });
      triggerShake("recipient_name");
      recipientRef.current?.focus();

      return;
    }

    // 2. 연락처 검증
    if (
      !newAddress.phone_number.trim() ||
      !validatePhone(newAddress.phone_number)
    ) {
      setErrors({
        recipient_name: false,
        phone_number: true,
        addressdetailinfo: false,
      });
      setErrorMessages({
        recipient_name: "",
        phone_number: !newAddress.phone_number.trim()
          ? t.errors.phoneRequired
          : t.errors.phoneInvalid,
        addressdetailinfo: "",
      });
      triggerShake("phone_number");
      phoneRef.current?.focus();

      return;
    }

    // 3. 기본 주소 검증
    if (!newAddress.addressinfo.trim()) {
      alert(t.errors.addressRequired);
      onSearchModal();

      return;
    }

    // 4. 상세 주소 검증
    if (
      !newAddress.addressdetailinfo.trim() ||
      hasIncompleteJamo(newAddress.addressdetailinfo)
    ) {
      setErrors({
        recipient_name: false,
        phone_number: false,
        addressdetailinfo: true,
      });
      setErrorMessages({
        recipient_name: "",
        phone_number: "",
        addressdetailinfo: !newAddress.addressdetailinfo.trim()
          ? t.errors.detailAddressRequired
          : t.errors.detailAddressInvalid,
      });
      triggerShake("addressdetailinfo");
      detailRef.current?.focus();

      return;
    }

    // 에러 상태 초기화
    setErrors({
      recipient_name: false,
      phone_number: false,
      addressdetailinfo: false,
    });
    setErrorMessages({
      recipient_name: "",
      phone_number: "",
      addressdetailinfo: "",
    });

    try {
      const payload: Omit<Address, "id" | "user_id" | "is_default"> = {
        ...newAddress,
        phone_number: newAddress.phone_number.replace(/[^0-9]/g, ""),
      };
      const savedData = await AddAddressDataBase(payload as Address);

      await queryClient.invalidateQueries({
        queryKey: queryKeys.address.list(),
      });
      setIsSubmitting(false);

      if (savedData) {
        openModal("address-add-arlam", <AddressDoneModal />);
        setIsAdding(false);
        setNewAddress({
          address_name: "",
          addressinfo: "",
          addressdetailinfo: "",
          recipient_name: "",
          phone_number: "",
        });
      }
    } catch (error) {
      console.error("저장 중 에러 발생:", error);
    }
  };

  // 💡 입력 폼 UI (동일 컴포넌트 내부에서 함수 형태로 렌더링)
  const renderInputForm = () => (
    <div className={styles.formGrid}>
      {/* 수령인 */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{t.recipient}</label>
        <div className={styles.inputBox}>
          <input
            ref={recipientRef}
            type="text"
            placeholder={t.recipientPlaceholder}
            value={newAddress.recipient_name}
            onChange={(e) => {
              setNewAddress({ ...newAddress, recipient_name: e.target.value });
              if (errors.recipient_name)
                setErrors((prev) => ({ ...prev, recipient_name: false }));
            }}
            className={clsx({
              [styles.hasValue]: newAddress.recipient_name.length > 0,
              [styles.errorInput]: errors.recipient_name,
              [styles.shake]: shakeField === "recipient_name",
            })}
          />
        </div>
        {errors.recipient_name && (
          <span className={styles.errorMessage}>
            {errorMessages.recipient_name}
          </span>
        )}
      </div>

      {/* 연락처 */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{t.contact}</label>
        <div className={styles.inputBox}>
          <input
            ref={phoneRef}
            type="tel"
            placeholder={t.contactPlaceholder}
            value={newAddress.phone_number}
            onChange={(e) => {
              setNewAddress({ ...newAddress, phone_number: e.target.value });
              if (errors.phone_number)
                setErrors((prev) => ({ ...prev, phone_number: false }));
            }}
            className={clsx({
              [styles.hasValue]: newAddress.phone_number.length > 0,
              [styles.errorInput]: errors.phone_number,
              [styles.shake]: shakeField === "phone_number",
            })}
          />
        </div>
        {errors.phone_number && (
          <span className={styles.errorMessage}>
            {errorMessages.phone_number}
          </span>
        )}
      </div>

      {/* 기본 주소 */}
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.fieldLabel}>{t.address}</label>
        <div className={styles.addrRow}>
          <div className={styles.inputBox}>
            <input
              type="text"
              placeholder={t.baseAddressPlaceholder}
              value={newAddress.addressinfo}
              readOnly
              className={clsx({
                [styles.hasValue]: newAddress.addressinfo.length > 0,
              })}
            />
          </div>
          <button
            type="button"
            className={`${styles.addrSearchBtn} ${styles.waterFx}`}
            onClick={onSearchModal}
          >
            {t.searchAddress}
          </button>
        </div>
      </div>

      {/* 상세 주소 */}
      <div className={`${styles.field} ${styles.full}`}>
        <div className={styles.inputBox}>
          <input
            ref={detailRef}
            type="text"
            placeholder={t.detailAddressPlaceholder}
            value={newAddress.addressdetailinfo}
            onChange={(e) => {
              setNewAddress({
                ...newAddress,
                addressdetailinfo: e.target.value,
              });
              if (errors.addressdetailinfo)
                setErrors((prev) => ({ ...prev, addressdetailinfo: false }));
            }}
            className={clsx({
              [styles.hasValue]: newAddress.addressdetailinfo.length > 0,
              [styles.errorInput]: errors.addressdetailinfo,
              [styles.shake]: shakeField === "addressdetailinfo",
            })}
          />
        </div>
        {errors.addressdetailinfo && (
          <span className={styles.errorMessage}>
            {errorMessages.addressdetailinfo}
          </span>
        )}
      </div>

      <button
        type="button"
        className={styles.saveBtn}
        onClick={handleSaveAddress}
        disabled={isSubmitting}
      >
        {t.save}
      </button>
    </div>
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelNo}>{t.step1No}</span>
        <span className={styles.panelTitle}>{t.step2Title}</span>
      </div>

      {/* 💡 1. 저장된 주소가 없으면 입력 폼을 바로 노출 */}
      {!address ? (
        renderInputForm()
      ) : (
        /* 💡 2. 저장된 주소가 있으면 기존 주소 카드 + [추가] 클릭 시 아코디언으로 노출 */
        <>
          <div
            key={address.id}
            className={`${styles.savedShip} ${styles.addressChanged}`}
          >
            <div className={styles.ssBody}>
              <div className={styles.ssTop}>
                <span className={styles.ssName}>{address.recipient_name}</span>
                <span className={styles.ssBadge}>{t.defaultBadge}</span>
              </div>
              <div className={styles.ssPhone}>{address.phone_number}</div>
              <div className={styles.ssAddr}>
                {address.addressinfo}
                <br />
                {address.addressdetailinfo}
              </div>
              <div className={styles.ssRequest}>{t.defaultRequest}</div>

              <div className={styles.actionWrap}>
                <button type="button" onClick={() => setIsAdding(!isAdding)}>
                  {isAdding ? t.cancel : t.add}
                </button>
                <button type="button" onClick={onModalOpen}>
                  {t.change}
                </button>
              </div>
            </div>
          </div>

          <div
            className={`${styles.expandFormContainer} ${isAdding ? styles.open : ""}`}
          >
            <div className={styles.expandFormInner}>{renderInputForm()}</div>
          </div>
        </>
      )}
    </div>
  );
}
// 입력 폼 컴포넌트 분리 (입력 시 포커스가 풀리거나 렌더링이 안 되던 버그 해결)

const ShopLoadingList = React.memo(function ShopLoadingList() {
  return (
    <ul className={styles.orderList}>
      {[1, 2, 3].map((items) => (
        <li className={styles.historySkeletonWrap} key={items}>
          <div className={styles.historySkeletonCard}>
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonThumbnail} />
            </div>
            <div className={styles.skeletonWrap}>
              <div className={styles.skeletonName} />
              <div className={styles.skeletonName} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
});

const ShopList = React.memo(function ShopList({
  item,
  quantities,
  onQuantityChange,
}: {
  item: Book[];
  quantities: Record<string, number>;
  onQuantityChange: (id: string, newQty: number) => void;
}) {
  return (
    <ul className={styles.orderList}>
      {item.map((items) => (
        <ShopItem
          key={items.id}
          item={items}
          quantities={quantities}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </ul>
  );
});

const ShopItem = React.memo(function ShopItem({
  item,
  quantities,
  onQuantityChange,
}: {
  item: Book;
  quantities: Record<string, number>;
  onQuantityChange: (id: string, newQty: number) => void;
}) {
  const { mutate: toggleShop } = useToggleShopMutation();
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  if (!item.id) {
    throw new Error("상품 ID가 존재하지 않습니다.");
  }
  const currentQty = quantities[item.id] || 1;

  const handleDelete = useCallback(() => {
    toggleShop(item);
  }, [toggleShop, item]);

  const calculatedPrice = useMemo(() => {
    const price = item.price || 0;

    return t.formatPrice
      ? t.formatPrice(price * currentQty)
      : `${(price * currentQty).toLocaleString()} ₩`;
  }, [t, item.price, currentQty]);

  return (
    <div className={styles.orderItem}>
      <DeleteButton onClick={handleDelete} />
      <div className={styles.oiThumb}>
        <Thumbnail w={60} h={80} data={item} />
      </div>
      <div className={styles.oiInfo}>
        <Title data={item} className={styles.oiTitle} />
        <Authors data={item} className={styles.oiMeta} />
        <QuantityControl
          itemId={item.id}
          quantities={quantities}
          onQuantityChange={onQuantityChange}
        />
      </div>
      <div className={styles.oiPrice}>{calculatedPrice}</div>
    </div>
  );
});

const EmptyShop = React.memo(function EmptyShop() {
  const { lang } = useLanguage();
  const t = SHOP_EMPTY_DICTIONARY[lang];

  const handleWaterEffect = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    for (let i = 0; i < 6; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = 12 + Math.random() * 18;
      const sx = Math.cos(a) * d;
      const sy = Math.sin(a) * d;
      const dr = document.createElement("span");

      dr.className = styles.droplet;
      dr.style.left = `${cx}px`;
      dr.style.top = `${cy}px`;
      dr.style.setProperty("--sx", `${sx.toFixed(1)}px`);
      dr.style.setProperty("--sy", `${sy.toFixed(1)}px`);
      el.appendChild(dr);
      dr.addEventListener("animationend", () => dr.remove());
    }
  };

  const descLines = useMemo(() => t.emptyDesc.split("\n"), [t.emptyDesc]);

  return (
    <div className={styles.cartEmpty}>
      <div className={styles.emptyEmblem}>
        <svg viewBox="0 0 64 64" fill="none">
          <circle
            className={styles.emptyRing}
            cx="32"
            cy="32"
            r="28"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          <circle
            className={styles.emptyRing}
            cx="32"
            cy="32"
            r="19"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <g
            transform="translate(22 22) scale(0.834)"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16l-1.5 10a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 7Z" />
            <path d="M8 7V5a4 4 0 0 1 8 0v2" />
          </g>
        </svg>
      </div>

      <div className={styles.emptyEyebrow}>{t.emptyEyebrow}</div>
      <div className={styles.emptyTitle}>{t.emptyTitle}</div>
      <div className={styles.emptyDesc}>
        {descLines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < descLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>

      <button
        type="button"
        className={clsx(styles.emptyCta, styles.waterFx)}
        onClick={handleWaterEffect}
      >
        {t.exploreCta}
      </button>
    </div>
  );
});

interface OrderSummarySectionProps {
  total: number;
  isAgreed: boolean;
  setIsAgreed: (agreed: boolean) => void;
  hasBothData: boolean;
  handlePayClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disable: boolean;
}

const OrderSummarySection = React.memo(function OrderSummarySection({
  total,
  isAgreed,
  setIsAgreed,
  handlePayClick,
  disable,
}: OrderSummarySectionProps) {
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  return (
    <aside className={`${styles.panel} ${styles.summary}`}>
      <span className={styles.panelTitle}>{t.summaryTitle}</span>

      <div className={styles.sumTotal}>
        <span className={styles.label}>{t.totalPrice}</span>
        <span className={styles.value}>{total.toLocaleString("ko-KR")} ₩</span>
      </div>

      <label className={styles.agree}>
        <input
          type="checkbox"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
        />
        <span className={styles.box} />
        <span>{t.agreeLabel}</span>
      </label>

      <button
        type="button"
        className={`${styles.payBtn} ${styles.waterFx}`}
        disabled={disable || !isAgreed} // <- 기존 조건(disable)이거나 체크박스가 해제(!isAgreed)된 경우 비활성화
        onClick={handlePayClick}
      >
        {t.payButton}
      </button>
    </aside>
  );
});

interface PaymentSectionProps {
  payMethod: PayMethod;
  setPayMethod: (method: PayMethod) => void;
}

const PaymentSection = React.memo(function PaymentSection({
  payMethod,
  setPayMethod,
}: PaymentSectionProps) {
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelNo}>{t.step3No}</span>
        <span className={styles.panelTitle}>{t.step3Title}</span>
      </div>
      <div className={styles.payOptions}>
        <button
          type="button"
          className={`${styles.payOption} ${payMethod === "card" ? styles.selected : ""}`}
          onClick={() => setPayMethod("card")}
        >
          <svg viewBox="0 0 24 24">
            <rect x="3" y="6" width="18" height="12" rx="1" />
            <path d="M3 10h18" />
          </svg>
          {t.payMethods?.card}
        </button>

        <button
          type="button"
          className={`${styles.payOption} ${payMethod === "bank" ? styles.selected : ""}`}
          onClick={() => setPayMethod("bank")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
          </svg>
          {t.payMethods?.bank}
        </button>

        <button
          type="button"
          className={`${styles.payOption} ${payMethod === "easy" ? styles.selected : ""}`}
          onClick={() => setPayMethod("easy")}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          {t.payMethods?.easy}
        </button>
      </div>
      {t.payDetails && (
        <div className={styles.payDetail}>{t.payDetails[payMethod]}</div>
      )}
    </div>
  );
});
