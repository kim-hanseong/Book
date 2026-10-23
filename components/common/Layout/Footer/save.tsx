"use client";

import React, { useState, MouseEvent, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";

import { useLanguage } from "../hook/useContextLanguge";
import { Thumbnail } from "../common/Product/Thumbnail";
import { Title } from "../common/Product/Title";
import QuantityControl from "../common/Product/Quantity/QuantityControl";
import { useModalStack } from "../hook/useContextModal";
import AddressListModal from "../common/Modal/AddressListModal";
import { Authors } from "../common/Product/Authors";
import AddressSearchModal from "../common/Modal/AddressSearchModal";
import AddressDoneModal from "../common/Modal/Arlam/AddAddressArlam";
import { DeleteButton } from "../common/button/DeleteBtn";

import styles from "./index.module.css";

import {
  AddAddressDataBase,
  AddressDataBase,
} from "@/lib/api/addressAction";
import { useToggleShopMutation } from "@/Hook/BuyBtn/useToggleBuyMutation";
import { queryKeys } from "@/lib/query/querykeys";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";
import { Address } from "@/types/address";
import { Book } from "@/types/book";
import { ORDER_DICTIONARY } from "@/constants/order/order";
import { SHOP_MODAL_DICTIONARY } from "@/constants/common/Modal/ShopModal/shopModal";


export type PayMethod = "card" | "bank" | "easy";

interface OrderPageProps {
  shop: Book[];
  address: Address[];
}

const THUMB_W = 126;
const THUMB_H = 178;

export default function OrderPage({ shop, address }: OrderPageProps) {
  const { data: shopList = [] } = useQuery<Book[]>({
    queryKey: queryKeys.cart.list(),
    queryFn: fetchBuyList,
    initialData: shop,
  });

  const { data: addressList = [], isLoading: isaddressListLoading } = useQuery({
    queryKey: ["addresses"], // 오타(addressess -> addresses) 수정
    queryFn: async (): Promise<Address[]> => {
      const postData = await AddressDataBase();

      return (postData ?? []) as Address[];
    },
    initialData: address,
  });
  const { openModal } = useModalStack();

  const [addressInfo, setAddressInfo] = useState<string>("");

  const handleOpenAddressSearchModal = () => {
    openModal(
      "address-search-modal",
      <AddressSearchModal onChangeAddress={setAddressInfo} />,
    );
  };

  const handleOpenReviewModal = () => {
    openModal("review-modal", <AddressListModal />);
  };

  const isEmpty = shopList.length === 0;
  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};

    shopList.forEach((item) => {
      initial[item.id] = item.qty || 1;
    });

    return initial;
  });

  const itemsTotal = shopList.reduce((sum, item) => {
    const currentQty = quantities[item.id] || 1;

    return sum + item.price * currentQty;
  }, 0);

  const totalPrice = itemsTotal;

  const [isAgreed, setIsAgreed] = useState(false);

  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [id]: newQty,
    }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div className={styles.eyebrow}>{t.eyebrow}</div>
        <div className={styles.pageTitle}>{t.pageTitle}</div>
      </div>
      <div className={styles.layout}>
        {/* 좌측 단계별 결제 정보 영역 */}
        <div className={styles.steps}>
          <AddressSection
            address={addressList}
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
            ) : (
              <ShopList
                item={shopList}
                quantities={quantities}
                onQuantityChange={handleQuantityChange}
              />
            )}
          </div>
        </div>
        <OrderSummarySection
          total={totalPrice}
          isAgreed={isAgreed}
          setIsAgreed={setIsAgreed}
        />
      </div>
    </div>
  );
}

function ShopTitle() {
  const { lang } = useLanguage();

  const t = SHOP_MODAL_DICTIONARY[lang];

  return (
    <div>
      <h3>{t.title}</h3>
    </div>
  );
}

/* ==========================================================================
   SUB COMPONENTS
   ========================================================================== */

function ShopList({
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
}

function ShopItem({
  item,
  quantities,
  onQuantityChange,
}: {
  item: Book;
  quantities: Record<string, number>;
  onQuantityChange: (id: string, newQty: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const { mutate: toggleShop } = useToggleShopMutation();

  const handleDelete = () => {
    toggleShop(item);
  };

  const { lang } = useLanguage();
  const t = ORDER_DICTIONARY[lang];

  const currentQty = quantities[item.id] || 1;

  return (
    <div key={item.id} className={styles.orderItem}>
      <DeleteButton
        onClick={() => {
          handleDelete(item);
        }}
      />
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
      <div className={styles.oiPrice}>
        {t.formatPrice
          ? t.formatPrice(item.price * currentQty)
          : `${(item.price * currentQty).toLocaleString()} ₩`}
      </div>
    </div>
  );
}
function EmptyShop() {
  const { lang } = useLanguage();

  const t = SHOP_MODAL_DICTIONARY[lang];

  return (
    <div className={styles.emptyShop}>
      <h4 className={styles.emptyTitle}>{t.emptyTitle}</h4>

      <p className={styles.emptyDescription}>{t.emptyDescription}</p>
    </div>
  );
}

function ShopFooter() {
  const { lang } = useLanguage();
  const t = SHOP_MODAL_DICTIONARY[lang];

  return (
    <div className={styles.shopFooter}>
      <button type="button" className={styles.purchaseButton}>
        {t.purchaseButton}
      </button>
    </div>
  );
}

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
      const payload: Address = {
        ...newAddress,
        phone_number: Number(newAddress.phone_number.replace(/[^0-9]/g, "")),
      };

      const savedData = await AddAddressDataBase(payload);

      if (savedData) {
        openModal("address-add-arlam", <AddressDoneModal />);
        await queryClient.invalidateQueries({ queryKey: ["addresses"] });
        await queryClient.invalidateQueries({ queryKey: ["addressess"] });
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
      >
        저장
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
                <span className={styles.ssBadge}>기본 배송지</span>
              </div>
              <div className={styles.ssPhone}>{address.phone_number}</div>
              <div className={styles.ssAddr}>
                {address.addressinfo}
                <br />
                {address.addressdetailinfo}
              </div>
              <div className={styles.ssRequest}>문 앞에 놓아주세요</div>

              <div className={styles.actionWrap}>
                <button type="button" onClick={() => setIsAdding(!isAdding)}>
                  {isAdding ? "취소" : "추가"}
                </button>
                <button type="button" onClick={onModalOpen}>
                  변경
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
interface OrderSummarySectionProps {
  total: number;
  isAgreed: boolean;
  setIsAgreed: (agreed: boolean) => void;
  handlePayClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

function OrderSummarySection({
  total,
  isAgreed,
  setIsAgreed,
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
        disabled={!isAgreed}
      >
        {t.payButton}
      </button>
    </aside>
  );
}
