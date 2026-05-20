import {
  IMG_EVENT_FRENCH_KISS,
  IMG_EVENT_MULUKUKU,
} from "@/assets/images";

export const events = [
  {
    id: "french-kiss-night",
    slug: "french-kiss-night",
    title: "French Kiss Night",
    date: "April 4, 2026",
    time: "10:00 PM – 4:00 AM",
    startDateISO: "2026-04-04T22:00:00+08:00",
    endDateISO: "2026-04-05T04:00:00+08:00",
    venue: "The Stratosphere — 4/F Century City Mall, Makati",
    venueName: "The Stratosphere",
    venueAddress: "4/F Century City Mall, Amorsolo Drive, Makati",
    category: "Gala",
    price: "₱3,000",
    priceAmount: 3000,
    currency: "PHP",
    feeNote: "No additional online booking fee. VAT may apply if required by law.",
    included: [
      "General admission to French Kiss Night",
      "Access to curated live DJ performances",
      "One complimentary welcome drink",
      "Digital QR e-ticket sent by email",
    ],
    paddlePriceId: import.meta.env.VITE_PADDLE_PRICE_FRENCH_KISS ?? "",
    image: IMG_EVENT_FRENCH_KISS,
    description: "An exclusive evening of French-inspired glamour, live music, premium cocktails, and unmatched Makati nightlife energy.",
    ticketLink: "https://celeweevent.com/event/french-kiss-night/#tribe-tickets__tickets-form",
    sold_out: false
  },
  {
    id: "dj-mulukuku-manila",
    slug: "dj-mulukuku-manila",
    title: "DJ Mulukuku Manila",
    date: "August 8, 2026",
    time: "11:00 PM",
    startDateISO: "2026-08-08T23:00:00+08:00",
    endDateISO: "2026-08-09T04:00:00+08:00",
    venue: "Stratosphere Events Space, Century Mall, Makati",
    venueName: "Stratosphere Events Space",
    venueAddress: "Century Mall, Makati, Metro Manila",
    category: "VIP",
    price: "₱1,500",
    priceAmount: 1500,
    currency: "PHP",
    feeNote: "No additional online booking fee. VAT may apply if required by law.",
    included: [
      "General admission to DJ Mulukuku Manila",
      "Live set access and event floor entry",
      "Priority check-in lane",
      "Digital QR e-ticket sent by email",
    ],
    paddlePriceId:
      import.meta.env.VITE_PADDLE_PRICE_DJ_MULUKUKU_MANILA
      ?? import.meta.env.VITE_PADDLE_PRICE_NUIT_BLANCHE
      ?? "",
    image: IMG_EVENT_MULUKUKU,
    description: "DJ Mulukuku live in Manila for an independence-themed night at Stratosphere Events Space.",
    ticketLink: "#",
    sold_out: false
  }
];
