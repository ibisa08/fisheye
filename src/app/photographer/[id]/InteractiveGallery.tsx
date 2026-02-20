"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { MediaGallery } from "./MediaGallery";

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

function formatNumberFR(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function InteractiveGallery({
  medias,
  photographerName,
  photographerPrice,
  initialTotalLikes,
}: {
  medias: Media[];
  photographerName: string;
  photographerPrice: number;
  initialTotalLikes: number;
}) {
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes);

  return (
    <>
      <MediaGallery
        medias={medias}
        photographerName={photographerName}
        onTotalLikesChange={setTotalLikes}
      />

      <aside className={styles.stickyBar} aria-label="Informations likes et prix">
        <div className={styles.stickyLikes}>
          {formatNumberFR(totalLikes)}{" "}
          <span aria-hidden="true" className={styles.heart}>
            ♥
          </span>
        </div>
        <div className={styles.stickyPrice}>
          {formatNumberFR(photographerPrice)}€ / jour
        </div>
      </aside>
    </>
  );
}