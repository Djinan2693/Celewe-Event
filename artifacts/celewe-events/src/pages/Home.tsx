import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/ui/EventCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Testimonial } from "@/components/ui/Testimonial";
import { events } from "@/lib/data";
import { SEO } from "@/components/SEO";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function Home() {
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="flex flex-col">
      <SEO
        title="Manila's Elite Nightlife & VIP Events"
        description="Céléwé Events — Manila's premier VIP nightlife agency. Exclusive events, private soirées, and unforgettable moments curated for the discerning few."
        canonicalPath="/"
      />
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="VIP Nightlife Experience"
            className="w-full h-full object-cover opacity-60"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10 pt-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.p variants={fadeIn} className="text-primary font-bold tracking-[0.3em] uppercase mb-6 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-primary block"></span>
              Manila's Elite Nightlife
            </motion.p>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.1] mb-8 text-white">
              OneNight <br />
              <span className="text-primary italic font-light">OneKiss</span> <br />
              PureMagic
            </motion.h1>
            <motion.p variants={fadeIn} className="text-lg md:text-2xl text-white/70 max-w-2xl mb-10 leading-relaxed font-light">
              Crafting Moments that Matter. Exclusive events, premium vibes, and unforgettable memories curated for the discerning few.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/events">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 py-6 text-lg tracking-wide uppercase">
                  Discover Events
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="rounded-none px-8 py-6 text-lg tracking-wide uppercase border-white/20 hover:bg-white hover:text-black transition-colors">
                  Our Story
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <SectionTitle 
                eyebrow="The Experience" 
                title="A Premier Experience Agency in Manila"
              />
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Specializing in high-end VIP events, we combine bold design with flawless execution to create moments that resonate within the elite community.
                </p>
                <p>
                  From the upcoming 'French Kiss' gala to exclusive nightlife activations, Céléwé sets the standard for premium entertainment.
                </p>
              </div>
              <div className="mt-10">
                <Link href="/about" className="inline-flex items-center gap-2 text-white font-medium hover:text-primary transition-colors border-b border-primary/30 hover:border-primary pb-1 uppercase tracking-wide text-sm">
                  Read our full story
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="aspect-[4/5] relative bg-card border border-border/50 overflow-hidden">
                <img
                  src="/images/mixology.png"
                  alt="Premium Mixology"
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={1000}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 right-10">
                  <p className="text-2xl font-heading italic">"Flawless execution. Unforgettable moments."</p>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 md:py-32 bg-card/30 border-y border-border/30">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <SectionTitle 
            eyebrow="Our Pillars" 
            title="Elevating the Standard"
            centered
            className="mb-20"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Bespoke Settings",
                desc: "Immersive decor, high-end lighting, and carefully curated atmospheres that transport you to another world.",
                number: "01"
              },
              {
                title: "Signature Events",
                desc: "Curated moments designed exclusively for Manila's elite, featuring top-tier entertainment and strict curation.",
                number: "02"
              },
              {
                title: "Premium Service",
                desc: "Exquisite mixology, theatrical pours, and attentive VIP hosting that anticipates every need.",
                number: "03"
              }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="group relative p-8 border border-border/40 hover:border-primary/50 transition-colors bg-background"
              >
                <div className="text-primary/20 font-heading text-6xl font-bold mb-6 group-hover:text-primary transition-colors">
                  {service.number}
                </div>
                <h3 className="text-2xl font-heading mb-4">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <SectionTitle 
              eyebrow="The Calendar" 
              title="Upcoming Soirées"
              className="mb-0"
            />
            <Link href="/events">
              <Button variant="outline" className="rounded-none border-white/20 hover:bg-white hover:text-black">
                View All Events
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 bg-card/50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <SectionTitle 
            eyebrow="Word of Mouth" 
            title="The Verdict"
            centered
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            <Testimonial 
              quote="Everything felt premium—from the venue to the crowd. Easy checkout, clear instructions, and fast confirmation."
              name="Nicole T"
              location="Manila"
            />
            <Testimonial 
              quote="Unreal atmosphere and a super smooth process. Paid via GCash, uploaded proof, and got confirmed quickly. 10/10."
              name="Sophia Turner"
              location="Makati"
            />
            <Testimonial 
              quote="Top-tier vibe and great organization. The ticket purchase was simple and the team was responsive. Will definitely come back."
              name="Mary Jones"
              location="BGC"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-primary z-0" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center mix-blend-multiply opacity-40 z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-0" />
        
        <div className="container max-w-[800px] mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Ready for an unforgettable night?
            </h2>
            <p className="text-xl text-white/80 mb-10 font-light">
              Secure your place at our next exclusive gathering.
            </p>
            <Link href="/events">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-none px-12 py-8 text-xl tracking-wider uppercase font-bold">
                Get Tickets Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
