"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./lightbox.module.css";

type Media = {
  id: number;
  title: string;
  image: string | null;
  video: string | null;
};

export function Lightbox({
  items,
  startIndex,
  onClose,
}: {
  items: Media[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(() => {
    if (!items || items.length === 0) return 0;
    const clamped = Math.min(Math.max(0, startIndex), items.length - 1);
    return clamped;
  });

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep index valid if items change
  useEffect(() => {
    if (!items || items.length === 0) return;
    setIndex((prev) => Math.min(Math.max(0, prev), items.length - 1));
  }, [items]);

  // Média courant
  const current = useMemo(() => {
    if (!items || items.length === 0) return null;
    return items[index] ?? items[0];
  }, [items, index]);

  // Safe src (trim filenames to avoid trailing spaces)
  const file = (current?.image ?? current?.video ?? "").trim();
  const src = file ? `/assets/${file}` : "";
  const isVideo = Boolean(current?.video);

  const next = useCallback(() => {
    if (!items || items.length === 0) return;
    setIndex((i) => (i + 1) % items.length);
  }, [items]);

  const prev = useCallback(() => {
    if (!items || items.length === 0) return;
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items]);

  // Disable scroll + focus management + minimal focus trap
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus close button
    closeBtnRef.current?.focus();

    // minimal focus trap: if focus escapes, bring it back to close button
    const onFocusIn = (e: FocusEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        closeBtnRef.current?.focus();
      }
    };
    document.addEventListener("focusin", onFocusIn);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus?.();
    };
  }, []);

  // Keyboard: ESC + arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, next, prev]);

  if (!current) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse média"
      onMouseDown={(e) => {
        // click on overlay closes
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.container} ref={containerRef}>
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Fermer la lightbox"
        >
          ✕
        </button>

        <button
          type="button"
          className={styles.navLeft}
          onClick={prev}
          aria-label="Média précédent"
          disabled={!items || items.length <= 1}
        >
          ‹
        </button>

        <div className={styles.mediaArea}>
          {!src ? (
            <p style={{ color: "#901c1c", fontWeight: 600, margin: 0 }}>
              Média introuvable (nom de fichier manquant ou incorrect).
            </p>
          ) : isVideo ? (
            <video className={styles.media} src={src} controls />
          ) : (
            // Use plain <img> to avoid Next Image optimizer 400 in lightbox
            <img className={styles.media} src={src} alt={current.title} />
          )}

          <p className={styles.caption}>{current.title}</p>
        </div>

        <button
          type="button"
          className={styles.navRight}
          onClick={next}
          aria-label="Média suivant"
          disabled={!items || items.length <= 1}
        >
          ›
        </button>
      </div>
    </div>
  );
}