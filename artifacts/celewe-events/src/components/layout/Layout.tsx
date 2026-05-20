import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { IMG_LOGO } from "@/assets/images";

const headerLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

const rootStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://celeweevent.com/#organization",
      name: "CÉLÉWÉ Events",
      legalName: "[Legal Entity Name Placeholder]",
      url: "https://celeweevent.com",
      email: "contact@celeweevent.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "[Legal Address Placeholder]",
        addressLocality: "Manila",
        addressCountry: "PH",
      },
      sameAs: [
        "https://www.instagram.com/celewe.events?utm_source=qr&igsh=MTRuY21mY3ZodXRzaw%3D%3D",
        "https://www.facebook.com/profile.php?id=61585966952557&rdid=JAeUbh8oY9EOFqpk&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GWTfupjGP%2F#",
        "https://www.tiktok.com/@celewe.events?_r=1&_t=ZS-92l40tvhhrt",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://celeweevent.com/#website",
      url: "https://celeweevent.com",
      name: "CÉLÉWÉ Events",
      publisher: { "@id": "https://celeweevent.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://celeweevent.com/events",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.226V2h-3.09v13.362a2.949 2.949 0 1 1-2.95-2.95c.289 0 .57.043.839.12V9.39a6.047 6.047 0 0 0-.84-.061A6.04 6.04 0 1 0 15.82 15.37V8.554a7.87 7.87 0 0 0 4.6 1.482V6.98a4.81 4.81 0 0 1-.831-.294z" />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinkClass = (href: string) =>
    `transition-colors ${location === href ? "text-primary" : "text-muted-foreground hover:text-white"}`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark selection:bg-primary selection:text-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(rootStructuredData)}</script>
      </Helmet>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src={IMG_LOGO}
              alt="Cèlewé Events" 
              className="h-8 md:h-10 object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide">
            {headerLinks.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <a
              href="https://www.tiktok.com/@celewe.events?_r=1&_t=ZS-92l40tvhhrt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-white/85 hover:text-white transition-colors"
            >
              <TikTokIcon size={18} />
            </a>
            <a
              href="https://www.instagram.com/celewe.events?utm_source=qr&igsh=MTRuY21mY3ZodXRzaw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-white/85 hover:text-white transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61585966952557&rdid=JAeUbh8oY9EOFqpk&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GWTfupjGP%2F#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-white/85 hover:text-white transition-colors"
            >
              <Facebook size={18} />
            </a>
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-6">
                Contacts
              </Button>
            </Link>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden">
          <nav className="flex flex-col gap-6 text-2xl font-heading mt-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/events" className="hover:text-primary transition-colors">Events</Link>
            <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </nav>
          <div className="mt-8">
            <Link href="/events">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-none">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main className="flex-grow flex flex-col relative z-10 pt-16">
        {children}
      </main>

      <footer className="border-t border-border/30 bg-background/50 py-16 mt-auto">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="md:col-span-2 space-y-6">
              <img 
                src={IMG_LOGO}
                alt="Cèlewé Events" 
                className="h-10 object-contain"
              />
              <p className="text-muted-foreground max-w-sm">
                Exclusive events, premium vibes, and unforgettable memories crafted by Cèlewé. Crafting Moments that Matter.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/celewe.events?utm_source=qr&igsh=MTRuY21mY3ZodXRzaw%3D%3D" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61585966952557&rdid=JAeUbh8oY9EOFqpk&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GWTfupjGP%2F#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <Facebook size={18} />
                </a>
                <a href="https://www.tiktok.com/@celewe.events?_r=1&_t=ZS-92l40tvhhrt" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <TikTokIcon size={18} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-heading text-lg mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">Upcoming Events</Link></li>
                <li><Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Gallery</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/product/french-kiss-night" className="text-muted-foreground hover:text-primary transition-colors">French Kiss Night</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg mb-6">Compliance</h4>
              <ul className="space-y-4">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Cèlewé Events. All rights reserved.</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/40">Manila's Elite Nightlife</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
