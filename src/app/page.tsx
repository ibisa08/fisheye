export const runtime = "nodejs";

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { getAllPhotographers } from "./lib/prisma-db";

export default async function Home() {
  const photographers = await getAllPhotographers();
  const mockupOrder = [243, 930, 82, 527, 925, 195];
  const orderIndex = new Map(mockupOrder.map((id, i) => [id, i]));
  const sortedPhotographers = [...photographers].sort(
    (a, b) => (orderIndex.get(a.id) ?? 999) - (orderIndex.get(b.id) ?? 999)
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

        <h1 className={styles.title}>Nos photographes</h1>
      </header>

      <section aria-label="Liste des photographes">
        <ul className={styles.grid}>
          {sortedPhotographers.map((p) => {
            const location = `${p.city}, ${p.country}`;
            const portraitSrc = `/assets/${p.portrait}`;

            return (
              <li key={p.id} className={styles.card}>
                <article>
                  <Link
                    href={`/photographer/${p.id}`}
                    className={styles.cardLink}
                    aria-label={`Voir le profil de ${p.name}`}
                  >
                    <div className={styles.avatarWrap}>
                      <Image
                        src={portraitSrc}
                        alt={p.name}
                        width={200}
                        height={200}
                        className={styles.avatar}
                        priority
                      />
                    </div>
                    <h2 className={styles.name}>{p.name}</h2>
                  </Link>

                  <p className={styles.location}>{location}</p>
                  <p className={styles.tagline}>{p.tagline}</p>
                  <p className={styles.price}>{p.price}€/jour</p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}