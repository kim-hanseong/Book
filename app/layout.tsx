import AuthProvider from "@/components/Auth/AuthProvider";
import Layout from "@/components/layOut";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import { LanguageProvider } from "@/components/hook/useContextLanguge";
import { ModalProvider } from "@/components/hook/useContextModal";

import { cookies } from "next/headers";

import { Language } from "@/types/il8n";
import { PersonaProvider } from "@/components/Context/usePersonaContext";
import Header from "@/components/common/Layout/Header";
import Footer from "@/components/common/Layout/Footer";

export const metadata = {
  title: "Book Store",
  description: "Book Store Application",
};

// revalidate = 0; // 이 옵션은 페이지를 동적으로 렌더링하도록 강제합니다.
// 만약 정적인 페이지가 많다면, 이 옵션을 제거하고 필요한 곳에서만 revalidate를 설정하는 것이 좋습니다.
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const cookieStore = await cookies();
  const savedLang = cookieStore.get("app_lang")?.value as Language | undefined;
  const initialLang: Language = savedLang === "en" ? "en" : "ko";

  return (
    <html lang={initialLang}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&family=Silkscreen:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider serverSession={session}>
          <LanguageProvider initialLang={initialLang}>
            <Layout>
              <PersonaProvider>
                <ModalProvider>
                  <Header />
                  {children}
                  <Footer />
                </ModalProvider>
              </PersonaProvider>
            </Layout>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
