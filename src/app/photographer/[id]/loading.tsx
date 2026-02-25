import type { ReactElement } from "react";

export default function Loading(): ReactElement {
  return (
    <main style={{ padding: 24 }}>
      <p>Chargement de la galerie…</p>
    </main>
  );
}