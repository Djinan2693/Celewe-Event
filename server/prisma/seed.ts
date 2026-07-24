import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seededEvents = [
  {
    slug: "french-kiss-night",
    title: "French Kiss Night",
    dateISO: "2026-04-04T22:00:00+08:00",
    venue: "The Stratosphere — 4/F Century City Mall, Makati",
    pricePHP: 3000,
    currency: "PHP",
  },
  {
    slug: "deja-vu-party",
    title: "Déjà-Vu Party",
    dateISO: "2026-08-29T19:00:00+08:00",
    venue: "UG Lounge, Makati",
    pricePHP: 1000,
    currency: "PHP",
  },
];

async function main() {
  // Note: the retired "dj-mulukuku-manila" event is intentionally left in place
  // because existing orders/tickets reference it (onDelete: Restrict). It is no
  // longer listed on the site, so it cannot be reserved.
  for (const event of seededEvents) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
