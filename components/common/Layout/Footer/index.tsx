"use client";
import React from "react";
import Link from "next/link";
import { FOOTER_DICTIONARY } from "@/constants/footer";
import styles from "./index.module.css";
import { useLanguage } from "@/components/hook/useContextLanguge";

export default function Footer() {
  const { lang } = useLanguage();
  const dictionary = FOOTER_DICTIONARY[lang];

  return (
    <FooterLayout>
      <FooterWrap>
        <FooterBrand
          brandName={dictionary.brandName}
          tagline={dictionary.tagline}
        />

        <FooterNav>
          <DefaultFooterLinks links={dictionary.links} />
        </FooterNav>
      </FooterWrap>
    </FooterLayout>
  );
}

const FooterLayout = ({ children }: { children: React.ReactNode }) => {
  return <footer className={styles.footer}>{children}</footer>;
};

const FooterWrap = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.footerWrap}>{children}</div>;
};

const FooterBrand = ({
  brandName,
  tagline,
}: {
  brandName: string;
  tagline: string;
}) => {
  return (
    <div className={styles.brandGroup}>
      <div className={styles.fw}>{brandName}</div>
      <div className={styles.tagline}>{tagline}</div>
    </div>
  );
};

const FooterNav = ({ children }: { children: React.ReactNode }) => {
  return <nav className={styles.footerNav}>{children}</nav>;
};

const DefaultFooterLinks = ({
  links,
}: {
  links: readonly { href: string; label: string }[];
}) => {
  return (
    <>
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </>
  );
};
