"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./contact.module.css";

export function ContactButton({ photographerName }: { photographerName: string }) {
  const [open, setOpen] = useState(false);

  const openerRef = useRef<HTMLElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const messageId = useId();

  const openModal = () => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    openerRef.current?.focus?.();
  };

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus close
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        closeBtnRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocusIn);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Projet OC: on peut juste logguer
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    console.log("Contact form:", Object.fromEntries(data.entries()));
    closeModal();
  };

  return (
    <>
      <button type="button" className={styles.cta} onClick={openModal}>
        Contactez-moi
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={`Contact me ${photographerName}`}
          onMouseDown={(e) => {
            // clic sur l’overlay => ferme
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className={styles.modal} ref={containerRef}>
            <div className={styles.headerRow}>
              <div>
                <h2 className={styles.title}>Contactez-moi</h2>
                <p className={styles.subtitle}>{photographerName}</p>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                className={styles.close}
                onClick={closeModal}
                aria-label="Close Contact form"
              >
                ×
              </button>
            </div>

            <form className={styles.form} onSubmit={onSubmit}>
              <label className={styles.label} htmlFor={firstNameId}>
                Prénom
              </label>
              <input
                id={firstNameId}
                name="firstName"
                className={styles.input}
                autoComplete="given-name"
                required
              />

              <label className={styles.label} htmlFor={lastNameId}>
                Nom
              </label>
              <input
                id={lastNameId}
                name="lastName"
                className={styles.input}
                autoComplete="family-name"
                required
              />

              <label className={styles.label} htmlFor={emailId}>
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                className={styles.input}
                autoComplete="email"
                required
              />

              <label className={styles.label} htmlFor={messageId}>
                Votre message
              </label>
              <textarea
                id={messageId}
                name="message"
                className={styles.textarea}
                rows={5}
                required
              />

              <button type="submit" className={styles.send}>
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}