import React from "react";
import { Link } from "wouter";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    category: string;
    price: string;
    image: string | null;
    description: string;
    sold_out: boolean;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="group relative overflow-hidden bg-card border border-border/50 transition-all duration-500 hover:border-primary/50">
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
        <img 
          src={event.image || ""} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Badge className="bg-primary/90 hover:bg-primary text-white rounded-none border-none px-3 py-1 font-medium">
            {event.category}
          </Badge>
        </div>
        
        <div className="absolute bottom-4 left-4 z-20">
          <Badge variant="outline" className="border-white/20 text-white/90 rounded-none bg-black/40 backdrop-blur-md">
            {event.price}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="font-heading text-2xl mb-3 group-hover:text-primary transition-colors">{event.title}</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary/70" />
                <span>{event.date} • {event.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary/70 shrink-0 mt-0.5" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground/80 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
          
          <div className="mt-4 pt-4 border-t border-border/50">
            <Link href={`/events/${event.slug}`} className="block">
              <Button 
                variant="ghost" 
                className="w-full justify-between hover:bg-primary hover:text-white rounded-none group/btn transition-all"
                disabled={event.sold_out}
              >
                {event.sold_out ? "Sold Out" : "View Details & Tickets"}
                {!event.sold_out && <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
