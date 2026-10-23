"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./index.module.css";

import { useLanguage } from "@/components/hook/useContextLanguge";
import { NOT_FOUND_DICTIONARY } from "@/constants/404";

interface RaindropData {
  id: number;
  left: string;
  width: string;
  height: string;
  op: string;
  dur: string;
  drift: string;
  fall: string;
}

interface WaterEffectElement {
  id: number;
  type: "droplet" | "ripple";
  x: number;
  y: number;
  sx?: string;
  sy?: string;
}

export default function NotFoundPage() {
  const { lang } = useLanguage();
  const dictionary = NOT_FOUND_DICTIONARY[lang];
  const pathname = usePathname();

  return (
    <>
      <div className={styles.grain} />
      <NotFoundLayout>
        <BrokenGate />
        <RainEffect />
        <NotFoundContent
          code={dictionary.code}
          eyebrow={dictionary.eyebrow}
          title={dictionary.title}
          desc={dictionary.desc}
          currentPath={pathname || "/books/unknown-pearl"}
          primaryAction={{
            href: "/",
            label: dictionary.homeBtn,
          }}
          secondaryAction={{
            href: "#search",
            label: dictionary.searchBtn,
          }}
        />
      </NotFoundLayout>
      <WordmarkFooter brandName={dictionary.brandName} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Sub Components & Layouts                        */
/* -------------------------------------------------------------------------- */

const NotFoundLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.stage}>{children}</div>;
};

const BrokenGate = () => {
  return (
    <div className={styles.brokenGate} aria-hidden="true">
      <svg viewBox="0 0 800 800">
        <path
          className={`${styles.bgRing} ${styles.r1}`}
          d="M 400 20 A 380 380 0 1 1 80 220"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
        <circle
          className={`${styles.bgRing} ${styles.r2}`}
          cx="400"
          cy="400"
          r="260"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};

const RainEffect = () => {
  const [drops, setDrops] = useState<RaindropData[]>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let timeoutId: NodeJS.Timeout;

    const spawnRaindrop = () => {
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      const depth = Math.random();
      const newDrop: RaindropData = {
        id: Date.now() + Math.random(),
        left: `${(Math.random() * 100).toFixed(2)}%`,
        width: `${(1 + depth * 0.5).toFixed(2)}px`,
        height: `${(10 + depth * 16).toFixed(1)}px`,
        op: (0.06 + depth * 0.14).toFixed(2),
        dur: `${(1.8 - depth * 0.6).toFixed(2)}s`,
        drift: `${((Math.random() - 0.5) * 16).toFixed(1)}px`,
        fall: `${(h + 40).toFixed(0)}px`,
      };

      setDrops((prev) => [...prev.slice(-15), newDrop]);
      timeoutId = setTimeout(spawnRaindrop, 900 + Math.random() * 1600);
    };

    timeoutId = setTimeout(spawnRaindrop, 800);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={styles.rainDrops} aria-hidden="true">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className={styles.raindrop}
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            ["--op" as string]: drop.op,
            ["--dur" as string]: drop.dur,
            ["--drift" as string]: drop.drift,
            ["--fall" as string]: drop.fall,
          }}
          onAnimationEnd={() => {
            setDrops((prev) => prev.filter((d) => d.id !== drop.id));
          }}
        />
      ))}
    </div>
  );
};

interface WaterButtonProps {
  href: string;
  label: string;
  isPrimary?: boolean;
}

const WaterFxButton = ({ href, label, isPrimary }: WaterButtonProps) => {
  const [effects, setEffects] = useState<WaterEffectElement[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const newEffects: WaterEffectElement[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 14 + Math.random() * 20;

      newEffects.push({
        id: Date.now() + Math.random(),
        type: "droplet",
        x: cx,
        y: cy,
        sx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
        sy: `${(Math.sin(angle) * dist).toFixed(1)}px`,
      });
    }

    setEffects((prev) => [...prev, ...newEffects]);

    setTimeout(() => {
      setEffects((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          type: "ripple",
          x: cx,
          y: cy,
        },
      ]);
    }, 260);
  };

  return (
    <Link
      href={href}
      className={`${styles.btn} ${styles.waterFx} ${isPrimary ? styles.primary : ""}`}
      onClick={handleClick}
    >
      {label}
      {effects.map((fx) =>
        fx.type === "droplet" ? (
          <span
            key={fx.id}
            className={styles.droplet}
            style={{
              left: `${fx.x}px`,
              top: `${fx.y}px`,
              ["--sx" as string]: fx.sx,
              ["--sy" as string]: fx.sy,
            }}
            onAnimationEnd={() =>
              setEffects((prev) => prev.filter((item) => item.id !== fx.id))
            }
          />
        ) : (
          <span
            key={fx.id}
            className={styles.ripple}
            style={{
              left: `${fx.x}px`,
              top: `${fx.y}px`,
            }}
            onAnimationEnd={() =>
              setEffects((prev) => prev.filter((item) => item.id !== fx.id))
            }
          />
        ),
      )}
    </Link>
  );
};

interface NotFoundContentProps {
  code: string;
  eyebrow: string;
  title: string;
  desc: string;
  currentPath: string;
  primaryAction: { href: string; label: string };
  secondaryAction: { href: string; label: string };
}

const NotFoundContent = ({
  code,
  eyebrow,
  title,
  desc,
  currentPath,
  primaryAction,
  secondaryAction,
}: NotFoundContentProps) => {
  return (
    <div className={styles.content}>
      <div className={styles.code}>{code}</div>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <div className={styles.title}>{title}</div>
      <p className={styles.desc}>{desc}</p>

      <div className={styles.pathNote}>
        <svg viewBox="0 0 24 24">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span>{currentPath}</span>
      </div>

      <div className={styles.actions}>
        <WaterFxButton
          href={primaryAction.href}
          label={primaryAction.label}
          isPrimary
        />
        <WaterFxButton
          href={secondaryAction.href}
          label={secondaryAction.label}
        />
      </div>
    </div>
  );
};

const WordmarkFooter = ({ brandName }: { brandName: string }) => {
  return (
    <div className={styles.wordmarkFooter}>
      <span className={styles.dot} />
      {brandName}
    </div>
  );
};
