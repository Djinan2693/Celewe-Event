import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Facebook, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="https://celeweevent.com/wp-content/uploads/2026/02/CE%CC%80LEWE%CC%81CROP.png" 
              alt="Céléwé Events" 
              className="h-8 md:h-10 object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <Link href="/events" className="text-muted-foreground hover:text-white transition-colors">Events</Link>
            <Link href="/about" className="text-muted-foreground hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-muted-foreground hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-6">
                Book Now
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
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
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
                src="https://celeweevent.com/wp-content/uploads/2026/02/CE%CC%80LEWE%CC%81CROP.png" 
                alt="Céléwé Events" 
                className="h-10 object-contain"
              />
              <p className="text-muted-foreground max-w-sm">
                Exclusive events, premium vibes, and unforgettable memories crafted by Céléwé. Crafting Moments that Matter.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-muted-foreground">
                  <Ticket size={18} />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-heading text-lg mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">Upcoming Events</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-heading text-lg mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-border/30 text-center text-sm text-muted-foreground/60 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} Céléwé Events. All rights reserved.</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground/40">Manila's Elite Nightlife</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
