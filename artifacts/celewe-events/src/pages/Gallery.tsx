import { motion } from "framer-motion";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SEO } from "@/components/SEO";

export function Gallery() {
  return (
    <div className="min-h-screen">
      <SEO
        title="Gallery"
        description="A visual archive of Manila's most exclusive evenings — Céléwé Events captured in light, atmosphere, and unforgettable detail."
        canonicalPath="/gallery"
      />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-10"
            style={{ background: "#970C10" }}
          />
        </div>

        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-primary text-xs uppercase tracking-[0.25em] font-medium mb-4 flex items-center gap-3">
              <span className="inline-block w-8 h-px bg-primary" />
              Our Moments
            </p>
            <h1 className="font-heading text-5xl md:text-7xl text-white leading-tight mb-6">
              Gallery
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              A visual archive of Manila's most exclusive evenings — captured in light, atmosphere, and unforgettable detail.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="pb-28">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GalleryGrid />
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 border-t border-white/10">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle
              eyebrow="Be Part of the Story"
              title="Your night awaits"
              centered
            />
            <p className="text-white/50 mt-4 mb-8 max-w-md mx-auto">
              Every great photo starts with showing up. Book your spot at the next Céléwé event.
            </p>
            <a
              href="/events"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-10 py-4 text-sm uppercase tracking-widest font-medium transition-colors duration-300"
            >
              View Upcoming Events
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
