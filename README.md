# FishEye (Next.js + Prisma/SQLite)

## ✨ Fonctionnalités

- **Page d’accueil** : liste des photographes.
- **Page photographe** : profil + galerie médias.
- **Tri** des médias : Popularité / Date / Titre (menu custom accessible clavier).
- **Likes interactifs** : mise à jour UI immédiate + persistance en base (API Next).
- **Lightbox** : ouverture d’un média en grand, navigation clavier (←/→), fermeture (ESC / clic overlay / bouton).
- **Formulaire de contact** : modale accessible (focus, ESC, clic overlay).

## 🧰 Stack technique

- **Next.js (App Router)** + **React**
- **TypeScript**
- **Prisma ORM**
- **SQLite** (base locale)

## ✅ Prérequis

- **Node.js 20+** (recommandé)
- npm

## 🚀 Installation

```bash
npm install
```

## 🗄️ Base de données (Prisma / SQLite)

### 1) Migrations (création de la DB)

```bash
npm run db:migrate
```

### 2) Seed (remplir la DB avec les données de `data/`)

```bash
npm run db:seed
```

### 3) Prisma Studio (visualiser la DB)

```bash
npm run db:studio
```

## ▶️ Lancer l’application

### Mode développement

```bash
npm run dev
```

Puis ouvrir :
- http://localhost:3000

### Build / production

```bash
npm run build
npm run start
```

## 🧪 Lint

```bash
npm run lint
```

## ♿ Accessibilité (points clés)

- **Navigation clavier** : Tab / Shift+Tab, flèches dans les menus, ESC pour fermer les modales.
- **Modales** : `role="dialog"`, `aria-modal`, focus management.
- **Images** : attributs `alt`.


## 📄 Licence

MIT
