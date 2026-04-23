import React from "react";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function About() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background border-b border-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <SectionTitle 
            eyebrow="Our Story" 
            title="Crafting Moments that Matter"
            className="mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 text-lg text-muted-foreground leading-relaxed">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="mb-6">
                Céléwé Event was born from a desire to elevate Manila's nightlife landscape. We saw a gap between standard club nights and truly immersive VIP experiences—so we decided to bridge it.
              </p>
              <p>
                As a premier experience agency, we specialize in high-end galas, private soirées, and exclusive nightlife activations. We don't just throw parties; we curate environments where every detail serves a purpose.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="mb-6">
                From securing the city's most coveted venues to enforcing strict stylistic curation, we combine bold design with flawless execution.
              </p>
              <p>
                Whether it's the thematic grandeur of the 'French Kiss' gala or the pristine elegance of 'Nuit Blanche', Céléwé creates moments that resonate deeply within the elite community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-card/30">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <SectionTitle 
            title="The Céléwé Standard"
            centered
            className="mb-20"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Exclusivity",
                desc: "We strictly curate our guest lists to ensure a cohesive, premium atmosphere."
              },
              {
                title: "Immersion",
                desc: "Every event features bespoke decor and lighting that transforms the venue entirely."
              },
              {
                title: "Excellence",
                desc: "From mixology to VIP hosting, our service is attentive, theatrical, and flawless."
              },
              {
                title: "Magnetism",
                desc: "We craft an undeniable energy that draws Manila's tastemakers and trendsetters."
              }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 border border-border/40 bg-background text-center hover:border-primary/50 transition-colors"
              >
                <h3 className="font-heading text-xl mb-4 text-white">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Imagery */}
      <section className="py-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-[60vh] min-h-[500px]">
          <div className="bg-card border-r border-border/50 relative overflow-hidden group">
            <img src="/images/french-kiss.png" alt="Atmosphere" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          <div className="bg-card border-r border-border/50 relative overflow-hidden group hidden md:block">
            <img src="/images/crimson-masquerade.png" alt="People" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          <div className="bg-card relative overflow-hidden group hidden lg:block">
            <img src="/images/nuit-blanche.png" alt="Details" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </div>
      </section>
    </div>
  );
}
