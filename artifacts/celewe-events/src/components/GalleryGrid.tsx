import type { FrenchKissGalleryItem } from "@/data/frenchKissGallery";

type GalleryGridProps = {
  items: FrenchKissGalleryItem[];
};

export function GalleryGrid({ items }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <img
          key={item.src}
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-auto rounded-lg"
        />
      ))}
    </div>
  );
}
