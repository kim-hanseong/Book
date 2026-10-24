"use client";

import Link from "next/link";
import { Globe, Search, ShoppingBag, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import Button from "../../button/EffectBtn";
import SearchModal from "../../Modal/GlobalModal/SearchModal";
import AuthButton from "../../button/AuthBtn";
import ShopModal from "../../Modal/ShopModal";

import styles from "./index.module.css";

import { HEADER_DICTIONARY } from "@/constants/navigation";
import { useModalStack } from "@/components/hook/useContextModal";
import { Language } from "@/types/il8n";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { Book } from "@/types/book";
import { queryKeys } from "@/lib/query/querykeys";
import { fetchBuyList } from "@/lib/query/Buy/fetchBuy";
import { logout, supabase } from "@/lib/supabase/supabase";
import { useSupabase } from "@/components/Auth/AuthProvider";

export default function Header() {
  const { lang, toggleLang } = useLanguage();
  const t = HEADER_DICTIONARY[lang];

  const { data: shopList = [] } = useQuery<Book[]>({
    queryKey: queryKeys.cart.list(),
    queryFn: fetchBuyList,
  });

  return (
    <HeaderLayout>
      <HeaderWrap>
        <HeaderWordmark />
        <HeaderActions>
          <LogoutButton />
          <LanguageChangeButton
            onToggle={toggleLang}
            currentLang={lang}
            ariaLabel={t.langAriaLabel}
          />
          <DefaultAuth ariaLabel={t.mypage} />
          <DefaultCart ariaLabel={t.cartAriaLabel} data={shopList} />
          <DefaultSearch ariaLabel={t.searchAriaLabel} />
        </HeaderActions>
      </HeaderWrap>
    </HeaderLayout>
  );
}

function LogoutButton() {
  const { session } = useSupabase(); // 💡 AuthProvider에서 session 상태 가져오기

  const handleAuthAction = async () => {
    if (session) {
      // 1. 로그인 상태인 경우 -> 로그아웃 실행
      const { error } = await supabase.auth.signOut();
      window.location.reload();
    }
  };
  return (
    <AuthButton onClick={handleAuthAction} className={styles.logout}>
      {session ? "Logout" : "Login"}
    </AuthButton>
  );
}

const HeaderLayout = ({ children }: { children: React.ReactNode }) => (
  <header className={styles.header}>{children}</header>
);

const HeaderWrap = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.headerWrap}>{children}</div>
);

const HeaderWordmark = () => (
  <div className={styles.wordmark}>
    <span className={styles.dot} />
    <Link href={"/"} className={styles.brandText}>
      THE ARCHIVE
    </Link>
  </div>
);

const HeaderActions = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.actions}>{children}</div>
);

const DefaultAuth = ({ ariaLabel }: { ariaLabel: string }) => {
  const router = useRouter();

  const handleClick = () => {
    // 필요에 따라 로그인 여부를 체크하여 모달을 띄우거나 마이페이지로 이동할 수 있습니다.
    // 예: 로그인 상태가 아니라면 openModal()을 호출하고, 맞다면 라우팅 처리

    router.push("/mypage");
  };

  return (
    <AuthButton
      className={styles.iconBtn}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      <User />
    </AuthButton>
  );
};

const DefaultSearch = ({ ariaLabel }: { ariaLabel: string }) => {
  const { openModal } = useModalStack();
  const handleOpenSearchModal = () => {
    openModal("search-modal", <SearchModal />);
  };

  return (
    <Button
      className={styles.iconBtn}
      onClick={handleOpenSearchModal}
      aria-label={ariaLabel}
    >
      <Search />
    </Button>
  );
};

export const DefaultCart = ({
  ariaLabel,
  data,
}: {
  ariaLabel: string;
  data: Book[];
}) => {
  const { openModal } = useModalStack();

  const count = data.length;

  const handleOpenSearchModal = () => {
    openModal("shop-modal", <ShopModal shop={data} />);
  };

  return (
    <AuthButton
      className={styles.cartIconBtn}
      onClick={handleOpenSearchModal}
      aria-label={ariaLabel}
    >
      <ShoppingBag />
      {count > 0 && (
        /* key에 count를 전달하여 값이 바뀔 때마다 애니메이션을 재실행합니다 */
        <span key={count} className={styles.cartBadge}>
          {count}
        </span>
      )}
    </AuthButton>
  );
};

const LanguageChangeButton = ({
  onToggle,
  currentLang,
  ariaLabel,
}: {
  onToggle: () => void;
  currentLang: Language;
  ariaLabel: string;
}) => (
  <Button className={styles.iconBtn} onClick={onToggle} aria-label={ariaLabel}>
    <Globe />
    <span style={{ fontSize: "12px", fontWeight: "600", marginLeft: "4px" }}>
      {currentLang.toUpperCase()}
    </span>
  </Button>
);
