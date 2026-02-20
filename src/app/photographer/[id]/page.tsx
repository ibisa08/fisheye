export const runtime = "nodejs";

import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

import {
  getPhotographer,
  getAllPhotographers,
  getAllMediasForPhotographer,
} from "@/app/lib/prisma-db";

import { ContactButton } from "./ContactButton";
import { InteractiveGallery } from "./InteractiveGallery";

export default async function PhotographerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  // Cas: ID invalide -> proposer des IDs existants
  if (Number.isNaN(id)) {
    const all = await getAllPhotographers();
    return (
      <main className={styles.page}>
        <Link href="/" className={styles.backLink}>
          ← Accueil
        </Link>

        <h1 className={styles.bigError}>ID invalide</h1>
        <p>Essaie avec un ID existant :</p>

        <ul className={styles.idList}>
          {all.map((p: { id: number; name: string }) => (
            <li key={p.id}>
              <Link href={`/photographer/${p.id}`}>
                {p.id} — {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const photographer = await getPhotographer(id);

  // Cas: photographe introuvable -> proposer des IDs existants
  if (!photographer) {
    const all = await getAllPhotographers();
    return (
      <main className={styles.page}>
        <Link href="/" className={styles.backLink}>
          ← Accueil
        </Link>

        <h1 className={styles.bigError}>Photographe introuvable</h1>
        <p>
          Aucun photographe avec l’ID <strong>{id}</strong>. Clique sur un ID
          existant :
        </p>

        <ul className={styles.idList}>
          {all.map((p: { id: number; name: string }) => (
            <li key={p.id}>
              <Link href={`/photographer/${p.id}`}>
                {p.id} — {p.name}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  const medias = await getAllMediasForPhotographer(id);

  // Total likes initial (le sticky dynamique se met ensuite à jour côté client)
  const totalLikes = medias.reduce(
    (sum: number, m: { likes: number | null }) => sum + (m.likes ?? 0),
    0
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="Accueil FishEye">
          <Image
            src="/logo.svg"
            alt="FishEye"
            width={200}
            height={50}
            className={styles.logoImg}
            priority
            unoptimized
          />
        </Link>
      </header>

      <section className={styles.profileCard} aria-label="Profil photographe">
        <div className={styles.profileLeft}>
          <h1 className={styles.name}>{photographer.name}</h1>
          <p className={styles.location}>
            {photographer.city}, {photographer.country}
          </p>
          <p className={styles.tagline}>{photographer.tagline}</p>
        </div>

        <div className={styles.profileCenter}>
          <ContactButton photographerName={photographer.name} />
        </div>

        <div className={styles.profileRight}>
          <div className={styles.avatarWrap}>
            <Image
              src={`/assets/${photographer.portrait}`}
              alt={photographer.name}
              width={200}
              height={200}
              className={styles.avatar}
              priority
            />
          </div>
        </div>
      </section>

      <InteractiveGallery
        medias={medias}
        photographerName={photographer.name}
        photographerPrice={photographer.price}
        initialTotalLikes={totalLikes}
      />
    </main>
  );
}