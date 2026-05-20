import { frenchKissGallery } from "@/data/frenchKissGallery";

export type GalleryCategory = "All" | "Nightlife" | "Private Party" | "Corporate" | "Wedding" | "VIP Table";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "All">;
  title: string;
  event?: string;
  span?: "wide" | "tall" | "normal";
}

export const galleryItems: GalleryItem[] = [
  ...frenchKissGallery.map((item, index) => ({
    id: `fk-${index + 1}`,
    src: item.src,
    alt: item.alt,
    category: "Nightlife" as const,
    title: `French Kiss Night ${index + 1}`,
    event: "French Kiss Night",
    span: "normal" as const,
  })),
  {
    id: "g1",
    src: "/images/french-kiss/1.jpg",
    alt: "VIP nightclub dance floor with dramatic lighting",
    category: "Nightlife",
    title: "Electric Atmosphere",
    event: "French Kiss Night",
    span: "wide",
  },
  {
    id: "g2",
    src: "/images/french-kiss/2.jpg",
    alt: "Premium cocktail bar with glowing bottles",
    category: "Nightlife",
    title: "Premium Mixology",
    event: "French Kiss Night",
    span: "normal",
  },
  {
    id: "g3",
    src: "/images/french-kiss/3.jpg",
    alt: "Luxurious private party table setting with candles",
    category: "Private Party",
    title: "Intimate Elegance",
    event: "Nuit Blanche",
    span: "normal",
  },
  {
    id: "g4",
    src: "/images/french-kiss/4.jpg",
    alt: "Elegant rooftop private party with city lights",
    category: "Private Party",
    title: "Skyline Soirée",
    event: "Nuit Blanche",
    span: "wide",
  },
  {
    id: "g5",
    src: "/images/french-kiss/6.jpg",
    alt: "Corporate gala event in a luxury ballroom",
    category: "Corporate",
    title: "Gala Evening",
    span: "normal",
  },
  {
    id: "g6",
    src: "/images/french-kiss/7.jpg",
    alt: "Corporate cocktail reception with elegant guests",
    category: "Corporate",
    title: "Executive Reception",
    span: "normal",
  },
  {
    id: "g7",
    src: "/images/french-kiss/8.jpg",
    alt: "Luxury wedding reception with dark floral arrangements",
    category: "Wedding",
    title: "La Nuit Romantique",
    span: "wide",
  },
  {
    id: "g8",
    src: "/images/french-kiss/9.jpg",
    alt: "Candlelit wedding ceremony with elegant florals",
    category: "Wedding",
    title: "Ceremony of Dreams",
    span: "normal",
  },
  {
    id: "g9",
    src: "/images/french-kiss/10.jpg",
    alt: "VIP table service with bottle sparklers",
    category: "VIP Table",
    title: "Sparkler Service",
    event: "Crimson Masquerade",
    span: "normal",
  },
  {
    id: "g10",
    src: "/images/french-kiss/11.jpg",
    alt: "Exclusive VIP lounge with premium seating",
    category: "VIP Table",
    title: "The Inner Circle",
    event: "Crimson Masquerade",
    span: "normal",
  },
  {
    id: "g11",
    src: "/images/french-kiss/12.jpg",
    alt: "DJ performing at luxury nightclub event",
    category: "Nightlife",
    title: "Sound & Soul",
    event: "French Kiss Night",
    span: "normal",
  },
  {
    id: "g12",
    src: "/images/french-kiss/13.jpg",
    alt: "Elegant guests at a private party celebrating",
    category: "Private Party",
    title: "Celebration",
    event: "Nuit Blanche",
    span: "normal",
  },
];

export const CATEGORIES: GalleryCategory[] = [
  "All",
  "Nightlife",
  "Private Party",
  "Corporate",
  "Wedding",
  "VIP Table",
];
