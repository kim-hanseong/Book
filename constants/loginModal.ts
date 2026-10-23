import { Language } from "@/types/il8n";

export interface AuthModalDictionary {
  closeAriaLabel: string;
  eyebrow: string;
  loginTitle: string;
  signupTitle: string;
  tabLogin: string;
  tabSignup: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  rememberMe: string;
  forgotPassword: string;
  btnPassed: string;
  btnPassGate: string;
  btnOpenFirstGate: string;
  dividerOr: string;
  noAccount: string;
  hasAccount: string;
  switchToSignup: string;
  switchToLogin: string;
}

export const AUTH_MODAL_DICTIONARY: Record<Language, AuthModalDictionary> = {
  ko: {
    closeAriaLabel: "닫기",
    eyebrow: "— 게이트를 통과하세요 —",
    loginTitle: "다시 만나서 반갑습니다",
    signupTitle: "새로운 독자를 맞이합니다",
    tabLogin: "로그인",
    tabSignup: "가입하기",
    emailLabel: "이메일",
    emailPlaceholder: "you@example.com",
    passwordLabel: "비밀번호",
    passwordPlaceholder: "••••••••",
    rememberMe: "로그인 유지",
    forgotPassword: "비밀번호를 잊으셨나요?",
    btnPassed: "통과됨 ✓",
    btnPassGate: "게이트 통과하기",
    btnOpenFirstGate: "첫 게이트 열기",
    dividerOr: "또는",
    noAccount: "아직 계정이 없으신가요? ",
    hasAccount: "이미 계정이 있으신가요? ",
    switchToSignup: "가입하기",
    switchToLogin: "로그인",
  },
  en: {
    closeAriaLabel: "Close",
    eyebrow: "— Pass Through the Gate —",
    loginTitle: "Welcome Back",
    signupTitle: "Welcome New Reader",
    tabLogin: "Login",
    tabSignup: "Sign Up",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    rememberMe: "Keep me logged in",
    forgotPassword: "Forgot password?",
    btnPassed: "Passed ✓",
    btnPassGate: "Pass Gate",
    btnOpenFirstGate: "Open First Gate",
    dividerOr: "OR",
    noAccount: "Don't have an account? ",
    hasAccount: "Already have an account? ",
    switchToSignup: "Sign Up",
    switchToLogin: "Login",
  },
};
