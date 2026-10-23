// components/modal/AuthModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";

import Button from "../../../button/EffectBtn";

import styles from "./index.module.css";

import { useModalStack } from "@/components/hook/useContextModal";
import { useLanguage } from "@/components/hook/useContextLanguge";
import { AUTH_MODAL_DICTIONARY } from "@/constants/loginModal";
import { signInWithKakao } from "@/lib/supabase/supabase";

// ----------------------------------------------------------------------
// 1. Types
// ----------------------------------------------------------------------
export type AuthMode = "login" | "signup";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode; // Optional로 지정하여 아이콘이 없어도 안전하게 처리
}

interface AuthTabsProps {
  mode: AuthMode;
  onChangeMode: (mode: AuthMode) => void;
}

// ----------------------------------------------------------------------
// 2. Internal Sub-Components
// ----------------------------------------------------------------------

function AuthInput({ label, icon, ...props }: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={`${styles.shell} ${isFocused ? styles.focused : ""}`}>
        {icon && icon}
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
      </div>
    </div>
  );
}

function AuthTabs({ mode, onChangeMode }: AuthTabsProps) {
  const { lang } = useLanguage();
  const dict = AUTH_MODAL_DICTIONARY[lang];

  const loginRef = useRef<HTMLButtonElement>(null);
  const signupRef = useRef<HTMLButtonElement>(null);
  const [underlineStyle, setUnderlineStyle] = useState<{
    left: number;
    width: number;
  }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const target = mode === "login" ? loginRef.current : signupRef.current;

    if (target) {
      setUnderlineStyle({
        left: target.offsetLeft,
        width: target.offsetWidth,
      });
    }
  }, [mode, dict]);

  return (
    <div className={styles.tabs}>
      <button
        ref={loginRef}
        type="button"
        className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
        onClick={() => onChangeMode("login")}
      >
        {dict.tabLogin}
      </button>
      <button
        ref={signupRef}
        type="button"
        className={`${styles.tab} ${mode === "signup" ? styles.active : ""}`}
        onClick={() => onChangeMode("signup")}
      >
        {dict.tabSignup}
      </button>
      <div
        className={styles.underline}
        style={{
          left: `${underlineStyle.left}px`,
          width: `${underlineStyle.width}px`,
        }}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. Main AuthModal Component
// ----------------------------------------------------------------------
export default function AuthModal() {
  const { lang } = useLanguage();
  const dict = AUTH_MODAL_DICTIONARY[lang];
  const { closeModal } = useModalStack();

  const [mode, setMode] = useState<AuthMode>("login");
  const [isPulse, setIsPulse] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPulse(true);
    setIsSuccess(true);

    setTimeout(() => {
      setIsPulse(false);
      setIsSuccess(false);
      closeModal();
    }, 1100);
  };

  return (
    <div className={`${styles.overlay} `}>
      <div className={styles.card}>
        <Button
          effect="water"
          className={styles.closeBtn}
          onClick={closeModal}
          aria-label={dict.closeAriaLabel}
        >
          ✕
        </Button>

        <div className={`${styles.emblem} ${isPulse ? styles.pulse : ""}`}>
          <svg viewBox="0 0 24 24">
            <path d="M12 3 4.5 9.5h15Z" />
            <path d="M12 8.2 6 13.2h12Z" />
            <path d="M12 12.6 7.4 17h9.2Z" />
            <path d="M12 17v4" />
          </svg>
        </div>
        <div className={styles.eyebrow}>{dict.eyebrow}</div>
        <div className={styles.title}>
          {mode === "login" ? dict.loginTitle : dict.signupTitle}
        </div>

        <AuthTabs mode={mode} onChangeMode={setMode} />

        <form onSubmit={handleSubmit}>
          {/* 주석 제거 및 정상적인 JSX 주입 */}
          <AuthInput
            label={dict.emailLabel}
            type="email"
            placeholder={dict.emailPlaceholder}
            required
            icon={<Mail />}
          />
          <AuthInput
            label={dict.passwordLabel}
            type="password"
            placeholder={dict.passwordPlaceholder}
            required
            icon={<LockKeyhole />}
          />

          <div className={styles.fieldRow}>
            <label className={styles.remember}>
              <input type="checkbox" id="rememberBox" />
              <span className={styles.box} />
              {dict.rememberMe}
            </label>
            <Link className={styles.forgot} href={"/"}>
              {dict.forgotPassword}
            </Link>
          </div>

          <Button
            type="submit"
            effect="water"
            className={`${styles.submitBtn} ${isSuccess ? styles.success : ""}`}
          >
            {isSuccess
              ? dict.btnPassed
              : mode === "login"
                ? dict.btnPassGate
                : dict.btnOpenFirstGate}
          </Button>
        </form>

        <div className={styles.divider}>
          <div className={styles.line} />
          <span>{dict.dividerOr}</span>
          <div className={styles.line} />
        </div>

        <div className={styles.socialRow}>
          <Button
            effect="water"
            className={styles.socialBtn}
            onClick={signInWithKakao}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Kakao
          </Button>
        </div>

        <div className={styles.switchNote}>
          {mode === "login" ? dict.noAccount : dict.hasAccount}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? dict.switchToSignup : dict.switchToLogin}
          </button>
        </div>
      </div>
    </div>
  );
}
