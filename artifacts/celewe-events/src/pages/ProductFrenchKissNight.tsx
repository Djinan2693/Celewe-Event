import React, { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import {
  Calendar,
  MapPin,
  Clock,
  Mail,
  QrCode,
  CheckCircle,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { events } from "@/lib/data";

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
    if (paddleEnv === "sandbox") window.Paddle.Environment.set("sandbox");
    window.Paddle.Setup({ token: clientToken });
    setReady(true);
  }, []);
  return ready;
}

const event = events.find((e) => e.slug === "french-kiss-night");

export function ProductFrenchKissNight() {
  const [accepted, setAccepted] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const paddleReady = usePaddle();
  const hasPaddle = !!(event?.paddlePriceId && paddleReady && window.Paddle);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin + (import.meta.env.BASE_URL ?? "/")
      : "/";

  const openPaddleCheckout = useCallback(() => {
    if (!window.Paddle || !event?.paddlePriceId) return;
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
  }, [baseUrl]);

  if (!event) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "French Kiss Night — VIP Entry Pass",
    description: event.description,
    url: "https://celeweevent.com/product/french-kiss-night",
    image: event.image,
    brand: { "@type": "Brand", name: "CÉLÉWÉ Events" },
    offers: {
      "@type": "Offer",
      url: "https://celeweevent.com/product/french-kiss-night",
      priceCurrency: "PHP",
      price: String(event.priceAmount),
      priceValidUntil: event.date,
      availability: event.sold_out
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "CÉLÉWÉ Events" },
    },
  };

  return (
    <>
      <SEO
        title="French Kiss Night — VIP Entry Pass | CÉLÉWÉ Events"
        description={`Buy your ticket to French Kiss Night — ${event.date} at ${event.venue}. ${event.price} PHP. QR e-ticket delivered by email.`}
        ogImage={event.image}
        canonicalPath="/product/french-kiss-night"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-end pb-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={event.image}
            alt="French Kiss Night"
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-transparent" />
        </div>
        <div className="relative container max-w-[1200px] mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-6" aria-label="breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <ChevronRight size={14} />
            <span className="text-white/80">French Kiss Night</span>
          </nav>
          <Badge className="bg-primary/20 text-primary border border-primary/40 mb-4 uppercase tracking-widest text-xs">
            {event.category}
          </Badge>
          <h1 className="font-heading text-4xl md:text-6xl mb-2 text-white">
            French Kiss Night
          </h1>
          <p className="text-xl text-white/60 font-medium">VIP Entry Pass</p>
        </div>
      </section>

      {/* Details + Purchase */}
      <section className="bg-[#EEEDE4] text-[#2D2021] py-16">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

            {/* Left: event info */}
            <div>
              <h2 className="font-heading text-2xl mb-6">Event Details</h2>
              <dl className="space-y-5 text-base">
                <div className="flex gap-3 items-start">
                  <Calendar className="shrink-0 mt-0.5 text-[#970C10]" size={18} />
                  <div>
                    <dt className="font-semibold">Date</dt>
                    <dd className="text-[#2D2021]/70">{event.date}</dd>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Clock className="shrink-0 mt-0.5 text-[#970C10]" size={18} />
                  <div>
                    <dt className="font-semibold">Time</dt>
                    <dd className="text-[#2D2021]/70">{event.time}</dd>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <MapPin className="shrink-0 mt-0.5 text-[#970C10]" size={18} />
                  <div>
                    <dt className="font-semibold">Venue</dt>
                    <dd className="text-[#2D2021]/70">{event.venue}</dd>
                  </div>
                </div>
              </dl>

              <h2 className="font-heading text-2xl mt-10 mb-5">What's Included</h2>
              <ul className="space-y-3">
                {event.included.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle className="shrink-0 mt-0.5 text-[#970C10]" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="font-heading text-2xl mt-10 mb-5">How Entry Works</h2>
              <ol className="space-y-4 text-[#2D2021]/75">
                {[
                  "Purchase your entry pass. Payment is processed securely through Paddle.",
                  "You receive a confirmation email with your unique QR code ticket within minutes of payment.",
                  "On the night, present your QR code at the entrance. Staff scan it for entry — no print needed.",
                  "Each QR code is single-use and tied to your name. A valid photo ID is required at the door.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#970C10] text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Right: purchase card */}
            <div>
              <div className="border border-[#2D2021]/15 rounded-2xl p-8 bg-white shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs text-[#2D2021]/50 uppercase tracking-widest mb-1">Entry Pass</p>
                    <p className="font-heading text-4xl text-[#970C10]">{event.price}</p>
                    <p className="text-sm text-[#2D2021]/50 mt-1">{event.currency} · per person</p>
                  </div>
                  <QrCode size={40} className="text-[#970C10]/30" />
                </div>

                {/* Delivery note */}
                <div className="bg-[#EEEDE4] rounded-lg p-4 mb-5 flex gap-3 items-start text-sm">
                  <Mail size={16} className="shrink-0 mt-0.5 text-[#970C10]" />
                  <p>
                    <strong>Ticket delivery by email.</strong> Your QR code e-ticket is sent to your email address immediately after successful payment. Check your spam folder if it doesn't arrive within 5 minutes.
                  </p>
                </div>

                <p className="text-xs text-[#2D2021]/50 mb-5">{event.feeNote}</p>

                {/* Legal checkbox */}
                <div className="border-t border-[#2D2021]/10 pt-6">
                  <label className="flex gap-3 items-start cursor-pointer select-none mb-6">
                    <input
                      type="checkbox"
                      className="mt-1 accent-[#970C10] w-4 h-4 shrink-0"
                      checked={accepted}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    <span className="text-sm text-[#2D2021]/65 leading-relaxed">
                      I have read and agree to the{" "}
                      <Link href="/terms" className="text-[#970C10] underline underline-offset-2">
                        Terms & Conditions
                      </Link>
                      ,{" "}
                      <Link href="/refund-policy" className="text-[#970C10] underline underline-offset-2">
                        Refund Policy
                      </Link>
                      , and{" "}
                      <Link href="/privacy" className="text-[#970C10] underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      . I understand tickets are non-transferable and entry requires a valid photo ID.
                    </span>
                  </label>

                  <Button
                    onClick={accepted ? (hasPaddle ? openPaddleCheckout : () => { window.location.href = `/events/${event.slug}`; }) : undefined}
                    disabled={!accepted || checkoutLoading || event.sold_out}
                    className="w-full bg-[#970C10] hover:bg-[#970C10]/90 text-white rounded-none py-6 text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {event.sold_out
                      ? "Sold Out"
                      : checkoutLoading
                      ? "Loading…"
                      : `Buy Entry Pass — ${event.price}`}
                  </Button>
                </div>

                <div className="mt-5 flex gap-2 items-center text-xs text-[#2D2021]/40 justify-center">
                  <Shield size={13} />
                  <span>Payments secured by Paddle. CÉLÉWÉ Events never stores card details.</span>
                </div>
              </div>

              {/* Help block */}
              <div className="mt-5 p-5 border border-[#2D2021]/10 rounded-xl text-sm text-[#2D2021]/65 bg-white">
                <p className="font-semibold text-[#2D2021] mb-2">Need help?</p>
                <p>
                  Email us at{" "}
                  <a href="mailto:contact@celeweevent.com" className="text-[#970C10] underline underline-offset-2">
                    contact@celeweevent.com
                  </a>
                  . We respond within 24 hours.
                </p>
                <p className="mt-2">
                  Refund requests: see our{" "}
                  <Link href="/refund-policy" className="text-[#970C10] underline underline-offset-2">
                    Refund Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="container max-w-[900px] mx-auto px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-6">About the Event</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{event.description}</p>
          <p className="text-muted-foreground mt-4 leading-relaxed">
            Céléwé Events curates the guest list to ensure a cohesive, premium atmosphere throughout
            the evening. Immersive décor, top-tier entertainment, and a crowd that understands the
            assignment — French Kiss Night is Manila nightlife at its finest.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/events">
              <Button variant="outline" className="rounded-none border-border/50 hover:bg-primary/10">
                View All Events
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="rounded-none border-border/50 hover:bg-primary/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
