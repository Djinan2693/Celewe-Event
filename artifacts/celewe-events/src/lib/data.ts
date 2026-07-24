import {
  IMG_EVENT_FRENCH_KISS,
  IMG_EVENT_DEJA_VU,
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
    id: "deja-vu-party",
    slug: "deja-vu-party",
    title: "Déjà-Vu Party",
    date: "August 29, 2026",
    time: "7:00 PM – 2:00 AM",
    startDateISO: "2026-08-29T19:00:00+08:00",
    endDateISO: "2026-08-30T02:00:00+08:00",
    venue: "UG Lounge, Makati",
    venueName: "UG Lounge",
    venueAddress: "UG Lounge, Makati, Metro Manila",
    category: "Party",
    price: "₱1,000",
    priceAmount: 1000,
    currency: "PHP",
    feeNote: "No additional online booking fee. VAT may apply if required by law.",
    included: [
      "General admission to the Déjà-Vu Party",
      "Live sets by Arnaukei and DJ Noah",
      "Event floor entry",
      "Digital QR e-ticket sent by email",
    ],
    paddlePriceId:
      import.meta.env.VITE_PADDLE_PRICE_DEJA_VU
      ?? import.meta.env.VITE_PADDLE_PRICE_NUIT_BLANCHE
      ?? "",
    image: IMG_EVENT_DEJA_VU,
    description: "Cèlewé Events presents the Déjà-Vu Party at UG Lounge Makati, featuring Arnaukei and DJ Noah. Reservations: 09771008568.",
    ticketLink: "#",
    sold_out: false
  }
];
