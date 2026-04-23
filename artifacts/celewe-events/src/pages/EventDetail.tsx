import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowLeft, CreditCard } from "lucide-react";
import { events } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

declare global {
  interface Window {
    Paddle?: {
      Setup: (opts: { token: string; eventCallback?: (e: unknown) => void }) => void;
      Environment: { set: (env: string) => void };
      Checkout: {
        open: (opts: {
          items: { priceId: string; quantity: number }[];
          customData?: Record<string, string>;
          settings?: {
            successUrl?: string;
            displayMode?: string;
            theme?: string;
            locale?: string;
          };
        }) => void;
      };
    };
  }
}

function usePaddle() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
    if (!clientToken || !window.Paddle) return;

    const paddleEnv = (import.meta.env.VITE_PADDLE_ENV as string | undefined) ?? "sandbox";
    if (paddleEnv === "sandbox") {
      window.Paddle.Environment.set("sandbox");
    }

    window.Paddle.Setup({ token: clientToken });
    setReady(true);
  }, []);

  return ready;
}

export function EventDetail() {
  const { slug } = useParams();
  const event = events.find(e => e.slug === slug);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const paddleReady = usePaddle();

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-heading mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-8">The event you are looking for does not exist or has passed.</p>
        <Link href="/events">
          <Button className="bg-primary hover:bg-primary/90 rounded-none">Browse Events</Button>
        </Link>
      </div>
    );
  }

  const hasPaddle = !!(event.paddlePriceId && paddleReady && window.Paddle);
  const baseUrl = window.location.origin + (import.meta.env.BASE_URL ?? "/");

  const openPaddleCheckout = useCallback(() => {
    if (!window.Paddle || !event.paddlePriceId) return;
    setCheckoutLoading(true);

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: event.paddlePriceId, quantity: 1 }],
        customData: {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventVenue: event.venue,
        },
        settings: {
          successUrl: `${baseUrl}payment/success`,
          displayMode: "overlay",
          theme: "dark",
        },
      });
    } finally {
      setTimeout(() => setCheckoutLoading(false), 1000);
    }
  }, [event, baseUrl]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDateISO,
    "endDate": event.endDateISO,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "image": `https://celeweevent.com${event.image}`,
    "url": `https://celeweevent.com/events/${event.slug}`,
    "location": {
      "@type": "Place",
      "name": event.venueName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": event.venueAddress,
        "addressLocality": "Metro Manila",
        "addressCountry": "PH"
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": "Céléwé Events",
      "url": "https://celeweevent.com"
    },
    "offers": {
      "@type": "Offer",
      "price": String(event.priceAmount),
      "priceCurrency": event.currency,
      "availability": event.sold_out
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      "url": `https://celeweevent.com/events/${event.slug}`,
      "validFrom": event.startDateISO
    }
  };

  return (
    <div className="flex flex-col pb-24">
      <SEO
        title={event.title}
        description={`${event.description} — ${event.date} at ${event.venue}.`}
        ogImage={`https://celeweevent.com${event.image}`}
        ogType="article"
        canonicalPath={`/events/${event.slug}`}
        jsonLd={jsonLd}
      />
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 z-0">
          <img
            src={event.image || "/images/hero-bg.png"}
            alt={event.title}
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
            width={1200}
            height={600}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 relative z-10 h-full flex flex-col justify-end pb-12">
          <Link href="/events" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 uppercase text-sm tracking-wider">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="bg-primary hover:bg-primary text-white rounded-none border-none px-4 py-1.5 text-sm font-medium">
              {event.category}
            </Badge>
            {event.sold_out && (
              <Badge variant="destructive" className="rounded-none border-none px-4 py-1.5 text-sm font-medium">
                SOLD OUT
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white mb-2 leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1200px] mx-auto px-4 md:px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-2xl font-heading mb-6 border-b border-border/50 pb-4">About the Event</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-foreground/90 leading-relaxed">{event.description}</p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Prepare for a night where reality blurs and pure magic takes over. Céléwé Events strictly curates the guest list to ensure a cohesive, premium vibe throughout the night. Immersive decor, top-tier entertainment, and a crowd that understands the assignment.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading mb-6 border-b border-border/50 pb-4">What to Expect</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                {["Premium venue setting and atmospheric design", "Exclusive performances and live sets", "High-end mixology and bottle service", "Professional photography coverage"].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Sidebar / Ticket Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 p-6 md:p-8 shadow-2xl">
              <div className="mb-8">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price per person</div>
                <div className="text-4xl font-heading text-primary">{event.price}</div>
                <div className="text-xs text-muted-foreground mt-2">Includes entrance and welcome drink.</div>
              </div>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <Calendar className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <div className="font-medium text-white text-sm">Date</div>
                    <div className="text-muted-foreground text-sm">{event.date}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <div className="font-medium text-white text-sm">Time</div>
                    <div className="text-muted-foreground text-sm">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <div className="font-medium text-white text-sm">Venue</div>
                    <div className="text-muted-foreground text-sm">{event.venue}</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={hasPaddle ? openPaddleCheckout : undefined}
                disabled={event.sold_out || checkoutLoading || !hasPaddle}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 text-sm tracking-widest uppercase font-medium disabled:opacity-50"
              >
                <CreditCard className="mr-2" size={18} />
                {event.sold_out
                  ? "Sold Out"
                  : checkoutLoading
                  ? "Opening checkout..."
                  : "Buy Ticket"}
              </Button>

              {!event.sold_out && (
                <p className="mt-4 text-center text-xs text-white/30">
                  Secure checkout powered by Paddle
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
