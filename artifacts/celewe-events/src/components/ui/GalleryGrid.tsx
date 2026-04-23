import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { galleryItems, CATEGORIES, type GalleryCategory, type GalleryItem } from "@/lib/gallery";

function useSwipe(onLeft: () => void, onRight: () => void) {
  const touchStartX = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0 ? onLeft() : onRight();
    }
    touchStartX.current = null;
  };

  return { onTouchStart, onTouchEnd };
}

function BlurImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 bg-[#1a1214] transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#2D2021] via-[#3a2426] to-[#2D2021]" />
      </div>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const swipe = useSwipe(onNext, onPrev);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      {...swipe}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 md:left-6 z-10 p-3 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full"
        aria-label="Previous"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 md:right-6 z-10 p-3 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full"
        aria-label="Next"
      >
        <ChevronRight size={32} />
      </button>

      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        className="relative flex flex-col items-center max-w-5xl max-h-[90vh] w-full px-14 md:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-[78vh] max-w-full object-contain rounded-sm shadow-2xl"
        />
        <div className="mt-4 text-center">
          <p className="text-white font-heading text-lg tracking-wide">{item.title}</p>
          {item.event && (
            <p className="text-white/50 text-sm mt-1 uppercase tracking-widest">{item.event}</p>
          )}
          <p className="text-primary text-xs mt-2 uppercase tracking-widest font-medium">{item.category}</p>
        </div>
        <p className="absolute bottom-0 right-14 md:right-20 text-white/30 text-sm tabular-nums">
          {index + 1} / {items.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

export function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory);

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : 0)),
  [filtered.length]);
  const nextImage = useCallback(() =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % filtered.length : 0)),
  [filtered.length]);

  return (
    <div className="w-full">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-10 md:mb-14">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-all duration-300 border ${
              activeCategory === cat
                ? "bg-primary border-primary text-white"
                : "border-white/20 text-white/50 hover:border-white/50 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`group relative cursor-pointer overflow-hidden ${
                item.span === "wide" ? "col-span-2" : ""
              } ${item.span === "tall" ? "row-span-2" : ""}`}
              style={{ aspectRatio: item.span === "wide" ? "16/7" : "4/3" }}
              onClick={() => openLightbox(idx)}
            >
              <BlurImage
                src={item.src}
                alt={item.alt}
                className="absolute inset-0 w-full h-full"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              {/* Zoom icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <div className="bg-primary/90 backdrop-blur-sm p-2 rounded-full">
                  <ZoomIn size={14} className="text-white" />
                </div>
              </div>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                <p className="text-white font-heading text-sm md:text-base leading-tight">{item.title}</p>
                <p className="text-primary text-[10px] uppercase tracking-widest mt-0.5">{item.category}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-white/30 text-sm tracking-widest uppercase">
          No images in this category yet
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
