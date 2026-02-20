"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import styles from "./media.module.css";
import { Lightbox } from "./Lightbox";

type Media = {
  id: number;
  photographerId: number;
  title: string;
  image: string | null;
  video: string | null;
  likes: number;
  date: string;
  price: number;
};

type SortKey = "popularity" | "date" | "title";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popularity", label: "Popularité" },
  { value: "date", label: "Date" },
  { value: "title", label: "Titre" },
];

export function MediaGallery({
  medias,
  photographerName,
  onTotalLikesChange,
}: {
  medias: Media[];
  photographerName: string;
  onTotalLikesChange?: (total: number) => void;
}) {
  
  const [items, setItems] = useState<Media[]>(() =>
    medias.map((m) => ({ ...m, likes: Math.max(0, m.likes ?? 0) }))
  );
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [loadingLikes, setLoadingLikes] = useState<Record<number, boolean>>({});
  const [sort, setSort] = useState<SortKey>("popularity");
  const sorted = useMemo(() => {
    const arr = [...items];
    if (sort === "popularity") arr.sort((a, b) => b.likes - a.likes);
    if (sort === "date") arr.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "title") arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }, [items, sort]);

  useEffect(() => {
    if (!onTotalLikesChange) return;
    const total = items.reduce((sum, m) => sum + Math.max(0, m.likes ?? 0), 0);
    onTotalLikesChange(total);
  }, [items, onTotalLikesChange]);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  const selectedLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Popularité";

  const menuOptions = SORT_OPTIONS.filter((o) => o.value !== sort);

  const openMenu = () => {
    setActiveIndex(0);
    setOpen(true);
    // Ensure focus moves into the menu (so Arrow keys work reliably)
    setTimeout(() => {
      optionRefs.current[0]?.focus();
    }, 0);
  };

  const closeMenu = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  const selectOption = (value: SortKey) => {
    setSort(value);
    closeMenu();
  };

  // Click outside
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  // Focus active option on open
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  const focusOption = (idx: number) => {
    optionRefs.current[idx]?.focus();
  };

  const setActiveAndFocus = (idx: number) => {
    setActiveIndex(idx);
    // Focus immediately to make the change visible even if the effect is delayed
    focusOption(idx);
  };

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open ? closeMenu() : openMenu();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openMenu();
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    // Let Tab move to the next focusable element, but close the menu first
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(activeIndex + 1, menuOptions.length - 1);
      setActiveAndFocus(next);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(activeIndex - 1, 0);
      setActiveAndFocus(prev);
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setActiveAndFocus(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setActiveAndFocus(Math.max(0, menuOptions.length - 1));
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = menuOptions[activeIndex];
      if (opt) selectOption(opt.value);
    }
  };

  async function handleLike(mediaId: number) {
    if (loadingLikes[mediaId]) return; 
    const alreadyLiked = Boolean(liked[mediaId]);
    const delta = alreadyLiked ? -1 : 1;
    const prevLikes = items.find((m) => m.id === mediaId)?.likes ?? 0;
    if (delta === -1 && prevLikes <= 0) {
      setLiked((prev) => ({ ...prev, [mediaId]: false }));
      return;
    }

    const optimisticLikes = Math.max(0, prevLikes + delta);
    setLoadingLikes((prev) => ({ ...prev, [mediaId]: true }));
    setLiked((prev) => ({ ...prev, [mediaId]: !alreadyLiked }));
    setItems((prev) =>
      prev.map((m) => (m.id === mediaId ? { ...m, likes: optimisticLikes } : m))
    );

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, delta }),
      });
      if (!res.ok) throw new Error("like failed");
      const data = await res.json();

      // Sync UI avec la DB
      setItems((prev) =>
        prev.map((m) => (m.id === mediaId ? { ...m, likes: data.likes } : m))
      );
    } catch {
      // rollback
      setLiked((prev) => ({ ...prev, [mediaId]: alreadyLiked }));
      setItems((prev) =>
        prev.map((m) => (m.id === mediaId ? { ...m, likes: prevLikes } : m))
      );
    } finally {
      setLoadingLikes((prev) => ({ ...prev, [mediaId]: false }));
    }
  }

  const [lightboxState, setLightboxState] = useState<
    { items: Media[]; startIndex: number } | null
  >(null);

  function openLightboxById(mediaId: number) {
    const snapshot = [...sorted];
    const startIndex = Math.max(0, snapshot.findIndex((m) => m.id === mediaId));
    setLightboxState({ items: snapshot, startIndex });
  }

  function closeLightbox() {
    setLightboxState(null);
  }

  return (
    <section aria-label={`Galerie de ${photographerName}`}>
      {/* Filtre */}
      <div className={styles.toolbar}>
        <span className={styles.sortLabel}>Trier par</span>

        <div className={styles.dropdown} ref={wrapRef}>
          <button
            ref={btnRef}
            type="button"
            className={styles.selectBtn}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls="sort-listbox"
            onClick={() => (open ? closeMenu() : openMenu())}
            onKeyDown={onButtonKeyDown}
          >
            <span className={styles.selectText}>{selectedLabel}</span>
            <span className={styles.chevron} aria-hidden="true" />
          </button>

          {open && (
            <ul
              id="sort-listbox"
              role="listbox"
              aria-label="Trier les médias"
              className={styles.menu}
              tabIndex={-1}
              onKeyDownCapture={onListKeyDown}
            >
              {menuOptions.map((opt, idx) => {
                const active = idx === activeIndex;

                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={false}
                    className={`${styles.option} ${active ? styles.optionActive : ""}`}
                    tabIndex={0}
                    ref={(el) => {
                      optionRefs.current[idx] = el;
                    }}
                    onMouseEnter={() => setActiveAndFocus(idx)}
                    onClick={() => selectOption(opt.value)}
                    onKeyDown={onListKeyDown}
                  >
                    {opt.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Grille médias */}
      <ul className={styles.grid}>
        {sorted.map((m) => {
          // Limite pro: trim des noms de fichiers (espaces)
          const file = (m.image ?? m.video ?? "").trim();
          const src = file ? `/assets/${file}` : "";

          const isLiked = Boolean(liked[m.id]);
          const isLoading = Boolean(loadingLikes[m.id]);

          return (
            <li key={m.id} className={styles.card}>
              <article>
                {/* Vignette -> ouvre lightbox */}
                <button
                  type="button"
                  className={styles.thumbBtn}
                  aria-label={`Ouvrir ${m.title} en grand`}
                  onClick={() => {
                    if (src) openLightboxById(m.id);
                  }}
                  disabled={!src}
                >
                  {m.video ? (
                    src ? (
                      <video className={styles.thumb} src={src} />
                    ) : (
                      <div style={{ height: 300, background: "#eee" }} />
                    )
                  ) : src ? (
                    <Image
                      className={styles.thumb}
                      src={src}
                      alt={m.title}
                      width={600}
                      height={400}
                    />
                  ) : (
                    <div style={{ height: 300, background: "#eee" }} />
                  )}
                </button>

                <div className={styles.meta}>
                  {/* Titre -> ouvre lightbox */}
                  <button
                    type="button"
                    className={styles.titleBtn}
                    onClick={() => {
                      if (src) openLightboxById(m.id);
                    }}
                    aria-label={`Ouvrir ${m.title} en grand`}
                    disabled={!src}
                  >
                    {m.title}
                  </button>

                  {/* Like */}
                  <button
                    type="button"
                    className={styles.likeBtn}
                    aria-pressed={isLiked}
                    aria-label={`Like ${m.title} (actuellement ${m.likes})`}
                    onClick={() => handleLike(m.id)}
                    disabled={isLoading}
                  >
                    {m.likes} <span aria-hidden="true">♥</span>
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      {/* Lightbox */}
      {lightboxState && (
        <Lightbox
          items={lightboxState.items}
          startIndex={lightboxState.startIndex}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}