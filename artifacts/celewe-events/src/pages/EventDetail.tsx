import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowLeft, Smartphone, Zap, QrCode, Send, CheckCircle2, Phone } from "lucide-react";
import { events } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { IMG_EVENT_FRENCH_KISS } from "@/assets/images";
import { GalleryGrid } from "@/components/GalleryGrid";
import { frenchKissGallery } from "@/data/frenchKissGallery";

const RESERVATION_SUCCESS_MESSAGE =
  "Your reservation has been received. Our team will contact you shortly with payment instructions.";

export function EventDetail() {
  const { slug } = useParams();
  const event = events.find(e => e.slug === slug);
  const [submitting, setSubmitting] = useState(false);
  const [reservationDone, setReservationDone] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    qty: 1,
    website: "", // honeypot — real users leave this empty
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

  async function submitReservation() {
    setFeedbackMessage(null);
    setIsError(false);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      setIsError(true);
      setFeedbackMessage("Please complete all fields before reserving.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          quantity: form.qty,
          website: form.website,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; errors?: string[] }
        | null;

      if (!response.ok || !payload?.ok) {
        setIsError(true);
        setFeedbackMessage(
          payload?.error ??
            payload?.errors?.join(" ") ??
            "We couldn't process your reservation. Please try again or contact us at 09771008568.",
        );
        return;
      }

      setReservationDone(true);
      setFeedbackMessage(RESERVATION_SUCCESS_MESSAGE);
    } catch {
      setIsError(true);
      setFeedbackMessage(
        "Network error. Please check your connection and try again, or contact us at 09771008568.",
      );
    } finally {
      setSubmitting(false);
    }
  }

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
                Ticket delivery: Once our team confirms your payment, your official QR e-ticket is sent to your email and can be scanned at venue entry.
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

              {!reservationDone && (
                <div className="space-y-3 mb-6">
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                    disabled={submitting}
                    className="w-full bg-background border border-border/50 px-3 py-2 text-sm disabled:opacity-50"
                  />
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                    disabled={submitting}
                    className="w-full bg-background border border-border/50 px-3 py-2 text-sm disabled:opacity-50"
                  />
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    disabled={submitting}
                    className="w-full bg-background border border-border/50 px-3 py-2 text-sm disabled:opacity-50"
                  />
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone / WhatsApp"
                    disabled={submitting}
                    className="w-full bg-background border border-border/50 px-3 py-2 text-sm disabled:opacity-50"
                  />
                  <input
                    value={form.qty}
                    onChange={(e) => setForm((prev) => ({ ...prev, qty: Math.max(1, Math.min(20, Number(e.target.value) || 1)) }))}
                    placeholder="Quantity"
                    type="number"
                    min={1}
                    max={20}
                    disabled={submitting}
                    className="w-full bg-background border border-border/50 px-3 py-2 text-sm disabled:opacity-50"
                  />
                  {/* Honeypot: hidden from real users, catches bots */}
                  <input
                    type="text"
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                </div>
              )}

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

              {!reservationDone && (
                <Button
                  onClick={submitReservation}
                  disabled={event.sold_out || submitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 text-sm tracking-widest uppercase font-medium disabled:opacity-50"
                >
                  <Send className="mr-2" size={18} />
                  {event.sold_out
                    ? "Sold Out"
                    : submitting
                    ? "Sending reservation..."
                    : "Reserve My Ticket"}
                </Button>
              )}

              {feedbackMessage && (
                <div
                  className={`mt-3 flex items-start gap-2 text-xs ${
                    isError ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {!isError && <CheckCircle2 size={14} className="shrink-0 mt-0.5" />}
                  <p>{feedbackMessage}</p>
                </div>
              )}

              {reservationDone && (
                <a
                  href="tel:09771008568"
                  className="mt-4 flex items-center justify-center gap-2 text-white/70 hover:text-white text-xs border border-border/40 py-3 transition-colors"
                >
                  <Phone size={13} />
                  <span>Urgent? Call us: 09771008568</span>
                </a>
              )}

              {!event.sold_out && !reservationDone && (
                <div className="mt-4 space-y-2 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Smartphone size={11} />
                    <span>No online payment — reserve now, our team contacts you</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <QrCode size={11} />
                    <span>QR e-ticket emailed once payment is confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Zap size={11} />
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
