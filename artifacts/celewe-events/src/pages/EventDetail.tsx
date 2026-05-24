import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearch } from "wouter";
import { Calendar, MapPin, Clock, ArrowLeft, CreditCard, Smartphone, Zap, QrCode } from "lucide-react";
import { events } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { IMG_EVENT_FRENCH_KISS } from "@/assets/images";
import { GalleryGrid } from "@/components/GalleryGrid";
import { frenchKissGallery } from "@/data/frenchKissGallery";

type CreatePaypalOrderResponse = {
  paypalOrderId: string;
  localOrderId: string;
  approvalUrl?: string | null;
};

export function EventDetail() {
  const { slug } = useParams();
  const search = useSearch();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const event = events.find(e => e.slug === slug);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    qty: 1,
  });

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

  const eventSlug = event.slug;
  const orderTotal = event.priceAmount * form.qty;

  async function startPaypalCheckout() {
    setFeedbackMessage(null);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      setFeedbackMessage("Please complete all buyer details before checkout.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          qty: form.qty,
        }),
      });

      const payload = (await response.json()) as CreatePaypalOrderResponse & { error?: string; errors?: string[] };

      if (!response.ok) {
        setFeedbackMessage(payload.error ?? payload.errors?.join(" ") ?? "Could not create PayPal order.");
        return;
      }

      if (!payload.approvalUrl) {
        setFeedbackMessage("PayPal approval link is missing.");
        return;
      }

      window.location.href = payload.approvalUrl;
    } catch {
      setFeedbackMessage("Network error while creating PayPal order.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  useEffect(() => {
    const token = query.get("token");
    const paypalStatus = query.get("paypal");

    if (!token || paypalStatus !== "success") {
      if (paypalStatus === "cancel") {
        setFeedbackMessage("PayPal payment was cancelled.");
      }
      return;
    }

    let active = true;
    setCaptureLoading(true);
    setFeedbackMessage("Finalizing PayPal payment...");

    fetch("/api/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypalOrderId: token }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          throw new Error(payload?.error ?? "Could not capture PayPal payment");
        }
        if (active) {
          setFeedbackMessage("Payment captured successfully. Your tickets are now active.");
        }
      })
      .catch((error: Error) => {
        if (active) {
          setFeedbackMessage(error.message);
        }
      })
      .finally(() => {
        if (active) {
          setCaptureLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": event.startDateISO,
    "endDate": event.endDateISO,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "image": event.image,
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
      "name": "Cèlewé Events",
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
        ogImage={event.image}
        ogType="article"
        canonicalPath={`/events/${event.slug}`}
        jsonLd={jsonLd}
      />
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 z-0">
          <img
            src={event.image || IMG_EVENT_FRENCH_KISS}
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
                  Prepare for a night where reality blurs and pure magic takes over. Cèlewé Events strictly curates the guest list to ensure a cohesive, premium vibe throughout the night. Immersive decor, top-tier entertainment, and a crowd that understands the assignment.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading mb-6 border-b border-border/50 pb-4">What to Expect</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                {event.included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Ticket delivery: After payment, your QR e-ticket is sent to your email and can be scanned at venue entry.
              </p>
            </div>

            {event.slug === "french-kiss-night" && (
              <div>
                <h2 className="text-2xl font-heading mb-6 border-b border-border/50 pb-4">French Kiss Gallery</h2>
                <GalleryGrid items={frenchKissGallery} />
              </div>
            )}

          </div>

          {/* Sidebar / Ticket Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 p-6 md:p-8 shadow-2xl">

              {/* Digital ticket badge */}
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2.5 mb-6">
                <Smartphone size={15} className="text-primary shrink-0" />
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">100% Digital Ticket</span>
                <Zap size={13} className="text-primary shrink-0 ml-auto" />
              </div>

              <div className="mb-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price per person</div>
                <div className="text-4xl font-heading text-primary">{event.price}</div>
                <div className="text-xs text-muted-foreground mt-2">Order total: {event.currency} {orderTotal.toLocaleString()}</div>
              </div>

              <div className="space-y-3 mb-6">
                <input
                  value={form.firstName}
                  onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm"
                />
                <input
                  value={form.lastName}
                  onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  type="email"
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone"
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm"
                />
                <input
                  value={form.qty}
                  onChange={(e) => setForm((prev) => ({ ...prev, qty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) }))}
                  placeholder="Quantity"
                  type="number"
                  min={1}
                  max={20}
                  className="w-full bg-background border border-border/50 px-3 py-2 text-sm"
                />
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
                onClick={startPaypalCheckout}
                disabled={event.sold_out || checkoutLoading || captureLoading}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 text-sm tracking-widest uppercase font-medium disabled:opacity-50"
              >
                <CreditCard className="mr-2" size={18} />
                {event.sold_out
                  ? "Sold Out"
                  : checkoutLoading
                  ? "Creating PayPal order..."
                  : captureLoading
                  ? "Capturing payment..."
                  : "Buy Ticket with PayPal"}
              </Button>

              {feedbackMessage && (
                <p className="mt-3 text-xs text-white/70">{feedbackMessage}</p>
              )}

              {!event.sold_out && (
                <div className="mt-4 space-y-2 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <CreditCard size={11} />
                    <span>Secure payment via PayPal</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <QrCode size={11} />
                    <span>QR ticket sent to your email instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Smartphone size={11} />
                    <span>Show QR at entrance — no print needed</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
