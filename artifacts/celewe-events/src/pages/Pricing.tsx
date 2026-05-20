import React from "react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/button";
import { events } from "@/lib/data";

export function Pricing() {
  return (
    <div className="pt-32 pb-24 md:pt-40 container max-w-[1000px] mx-auto px-4 md:px-6">
      <SEO
        title="Pricing"
        description="Transparent ticket pricing in PHP for CÉLÉWÉ Events, including sample event ticket prices, delivery details, and fee notes."
        canonicalPath="/pricing"
      />

      <SectionTitle
        title="Ticket Pricing"
        subtitle="Clear pricing for CÉLÉWÉ Events ticket sales in Philippine Peso (PHP)."
        className="mb-10"
      />

      <div className="border border-primary/30 bg-primary/10 p-6 mb-8">
        <h2 className="font-heading text-2xl mb-3">Pricing Currency & Delivery</h2>
        <p className="text-muted-foreground leading-relaxed">
          All prices are shown in PHP. Every paid ticket is delivered as a digital QR e-ticket by email.
        </p>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <article key={event.id} className="border border-border/40 bg-card/40 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="font-heading text-2xl text-white">{event.title}</h3>
              <p className="text-3xl font-heading text-primary">{event.price}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
              <p><span className="text-white">Date & time:</span> {event.date} · {event.time}</p>
              <p><span className="text-white">Venue:</span> {event.venue}</p>
              <p><span className="text-white">Currency:</span> {event.currency}</p>
              <p><span className="text-white">Delivery:</span> E-ticket by email (QR code)</p>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{event.feeNote}</p>

            <div>
              <h4 className="text-white font-medium mb-2">Included with this ticket</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {event.included.map((item) => (
                  <li key={`${event.id}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 border border-border/40 p-6">
        <h2 className="font-heading text-xl mb-3">Sample Ticket Price</h2>
        <p className="text-muted-foreground">
          Example: French Kiss Night General Admission is currently listed at <span className="text-white">₱3,000 PHP</span>.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link href="/events">
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-none">View Events</Button>
        </Link>
        <Link href="/terms">
          <Button variant="outline" className="rounded-none">Read Terms</Button>
        </Link>
      </div>
    </div>
  );
}
