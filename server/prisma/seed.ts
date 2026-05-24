import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seededEvent = {
  slug: "dj-mulukuku-manila",
  title: "DJ Mulukuku Manila",
  dateISO: "2026-06-20T21:00:00.000Z",
  venue: "Manila",
  pricePHP: 1500,
  currency: "PHP",
};

async function main() {
  await prisma.event.deleteMany({
    where: {
      slug: "french-kiss-night",
    },
  });

  await prisma.event.upsert({
    where: { slug: seededEvent.slug },
    update: seededEvent,
    create: seededEvent,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });