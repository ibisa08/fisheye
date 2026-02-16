-- CreateTable
CREATE TABLE "Photographer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "portrait" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "photographerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "video" TEXT,
    "likes" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    CONSTRAINT "Media_photographerId_fkey" FOREIGN KEY ("photographerId") REFERENCES "Photographer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
