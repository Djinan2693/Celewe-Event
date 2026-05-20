import React, { useState } from "react";
import { motion } from "framer-motion";
import { EventCard } from "@/components/ui/EventCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { events } from "@/lib/data";
import { SEO } from "@/components/SEO";
import { IMG_CONTACT_HEADER } from "@/assets/images";

export function Events() {
  const [filter, setFilter] = useState<string | null>(null);
  
  const categories = Array.from(new Set(events.map(e => e.category)));
  
  const filteredEvents = filter 
    ? events.filter(e => e.category === filter)
    : events;

  return (
    <div className="flex flex-col pb-24">
      <SEO
        title="Upcoming Events"
        description="Browse CÉLÉWÉ Events tickets with clear pricing, date and time, venue details, and what is included in each ticket."
        canonicalPath="/events"
      />
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-background border-b border-border/30 relative overflow-hidden">
        <img
          src={IMG_CONTACT_HEADER}
          alt="Cèlewé event ambience"
          className="absolute top-0 left-0 w-full h-full max-w-full object-cover opacity-10 mix-blend-screen pointer-events-none"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
          <SectionTitle 
            eyebrow="The Roster" 
            title="Upcoming Events"
            subtitle="Secure your place at Manila's most exclusive gatherings. Carefully curated, flawlessly executed."
            className="mb-8"
          />
          
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => setFilter(null)}
              className={`px-5 py-2 text-sm uppercase tracking-wider transition-colors border ${
                filter === null 
                  ? "bg-primary border-primary text-white" 
                  : "border-border/50 text-muted-foreground hover:border-white hover:text-white"
              }`}
            >
              All Events
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 text-sm uppercase tracking-wider transition-colors border ${
                  filter === cat 
                    ? "bg-primary border-primary text-white" 
                    : "border-border/50 text-muted-foreground hover:border-white hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="pt-16 md:pt-24">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border/40 p-6">
              <h2 className="font-heading text-2xl text-white mb-3">What We Sell</h2>
              <p className="text-muted-foreground leading-relaxed">
                We sell event tickets for CÉLÉWÉ Events, including curated nightlife experiences, premium themed parties, and VIP entry access in Manila.
              </p>
            </div>
            <div className="border border-primary/30 bg-primary/10 p-6">
              <h2 className="font-heading text-2xl text-white mb-3">How Ticket Delivery Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                After payment, your e-ticket with a scannable QR code is delivered to your email. Bring the QR code on your phone at check-in. No printed ticket is required.
              </p>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
              </div>

              <div className="mt-12 border border-border/40 bg-card/40 p-8">
                <h2 className="font-heading text-2xl mb-6">Detailed Ticket Breakdown</h2>
                <div className="space-y-8">
                  {filteredEvents.map((event) => (
                    <article key={`${event.id}-details`} className="border-b border-border/30 pb-6 last:border-b-0 last:pb-0">
                      <h3 className="font-heading text-xl text-white mb-3">{event.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                        <p><span className="text-white">Ticket price:</span> {event.price} {event.currency}</p>
                        <p><span className="text-white">Date & time:</span> {event.date} · {event.time}</p>
                        <p><span className="text-white">Venue:</span> {event.venue}</p>
                        <p><span className="text-white">Delivery:</span> QR e-ticket by email</p>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{event.feeNote}</p>
                      <div>
                        <h4 className="text-white font-medium mb-2">What is included</h4>
                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                          {event.included.map((item) => (
                            <li key={`${event.id}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 border border-dashed border-border/50">
              <h3 className="text-2xl font-heading mb-2">No events found</h3>
              <p className="text-muted-foreground">Check back later for more exclusive soirées.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
