import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function readJson(relPath) {
  const fullPath = path.join(__dirname, "..", relPath);
  const content = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(content);
}

async function main() {
  const photographers = await readJson("data/photographer.json");
  const medias = await readJson("data/media.json");

  // reseed propre
  await prisma.media.deleteMany();
  await prisma.photographer.deleteMany();

  await prisma.photographer.createMany({ data: photographers });
  await prisma.media.createMany({ data: medias });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });