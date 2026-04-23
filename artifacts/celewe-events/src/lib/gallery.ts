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
  {
    id: "g1",
    src: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&q=80",
    alt: "VIP nightclub dance floor with dramatic lighting",
    category: "Nightlife",
    title: "Electric Atmosphere",
    event: "French Kiss Night",
    span: "wide",
  },
  {
    id: "g2",
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    alt: "Premium cocktail bar with glowing bottles",
    category: "Nightlife",
    title: "Premium Mixology",
    event: "French Kiss Night",
    span: "normal",
  },
  {
    id: "g3",
    src: "https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&q=80",
    alt: "Luxurious private party table setting with candles",
    category: "Private Party",
    title: "Intimate Elegance",
    event: "Nuit Blanche",
    span: "normal",
  },
  {
    id: "g4",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    alt: "Elegant rooftop private party with city lights",
    category: "Private Party",
    title: "Skyline Soirée",
    event: "Nuit Blanche",
    span: "wide",
  },
  {
    id: "g5",
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    alt: "Corporate gala event in a luxury ballroom",
    category: "Corporate",
    title: "Gala Evening",
    span: "normal",
  },
  {
    id: "g6",
    src: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    alt: "Corporate cocktail reception with elegant guests",
    category: "Corporate",
    title: "Executive Reception",
    span: "normal",
  },
  {
    id: "g7",
    src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80",
    alt: "Luxury wedding reception with dark floral arrangements",
    category: "Wedding",
    title: "La Nuit Romantique",
    span: "wide",
  },
  {
    id: "g8",
    src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
    alt: "Candlelit wedding ceremony with elegant florals",
    category: "Wedding",
    title: "Ceremony of Dreams",
    span: "normal",
  },
  {
    id: "g9",
    src: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
    alt: "VIP table service with bottle sparklers",
    category: "VIP Table",
    title: "Sparkler Service",
    event: "Crimson Masquerade",
    span: "normal",
  },
  {
    id: "g10",
    src: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
    alt: "Exclusive VIP lounge with premium seating",
    category: "VIP Table",
    title: "The Inner Circle",
    event: "Crimson Masquerade",
    span: "normal",
  },
  {
    id: "g11",
    src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    alt: "DJ performing at luxury nightclub event",
    category: "Nightlife",
    title: "Sound & Soul",
    event: "French Kiss Night",
    span: "normal",
  },
  {
    id: "g12",
    src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
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
