import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { Calendar, MapPin, Clock, ArrowLeft, Ticket, AlertCircle } from "lucide-react";
import { events } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function EventDetail() {
  const { slug } = useParams();
  const event = events.find(e => e.slug === slug);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

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

  return (
    <div className="flex flex-col pb-24">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <div className="absolute inset-0 z-0">
          <img 
            src={event.image || "/images/hero-bg.png"} 
            alt={event.title} 
            className="w-full h-full object-cover"
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
                <p className="text-lg text-foreground/90 leading-relaxed">
                  {event.description}
                </p>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Prepare for a night where reality blurs and pure magic takes over. Céléwé Events strictly curates the guest list to ensure a cohesive, premium vibe throughout the night. Immersive decor, top-tier entertainment, and a crowd that understands the assignment.
                </p>
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-heading mb-6 border-b border-border/50 pb-4">What to Expect</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Premium venue setting and atmospheric design</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Exclusive performances and live sets</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>High-end mixology and bottle service</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>Professional photography coverage</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar / Ticket Box */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border/50 p-6 md:p-8 shadow-2xl">
              <div className="mb-8">
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Price</div>
                <div className="text-4xl font-heading text-primary">{event.price}</div>
                <div className="text-xs text-muted-foreground mt-2">Per person. Includes entrance and welcome drink.</div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <Calendar className="text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-white">Date</div>
                    <div className="text-muted-foreground">{event.date}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Clock className="text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-white">Time</div>
                    <div className="text-muted-foreground">{event.time}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <MapPin className="text-primary mt-1 shrink-0" />
                  <div>
                    <div className="font-medium text-white">Venue</div>
                    <div className="text-muted-foreground">{event.venue}</div>
                  </div>
                </div>
              </div>

              <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 text-lg tracking-wide uppercase"
                    disabled={event.sold_out}
                  >
                    <Ticket className="mr-2" />
                    {event.sold_out ? "Sold Out" : "Buy Ticket"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border/50 sm:max-w-md rounded-none">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Ticket Purchase Process</DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                      Follow these steps to secure your spot for {event.title}.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 py-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-medium text-white mb-1">Send Payment via GCash</h4>
                        <p className="text-sm text-muted-foreground">Send {event.price} to GCash number: <span className="text-white font-mono bg-black/30 px-2 py-0.5 ml-1">0917 123 4567</span></p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-medium text-white mb-1">Save Receipt</h4>
                        <p className="text-sm text-muted-foreground">Take a screenshot of your successful transaction.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-medium text-white mb-1">Fill Out Form</h4>
                        <p className="text-sm text-muted-foreground">Proceed to the ticketing form to upload your proof and provide details.</p>
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/30 p-4 flex gap-3 text-sm text-white mt-4">
                      <AlertCircle className="text-primary shrink-0" size={18} />
                      <p>Tickets are strictly non-refundable. Confirmation will be sent within 24 hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 mt-4">
                    <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none py-6 uppercase tracking-wider">
                        Proceed to Form
                      </Button>
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
