import React from "react";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialProps {
  quote: string;
  name: string;
  location: string;
}

export function Testimonial({ quote, name, location }: TestimonialProps) {
  return (
    <div className="bg-card/50 border border-border/50 p-8 md:p-10 relative">
      <Quote className="absolute top-6 right-6 text-primary/20 w-12 h-12" />
      
      <p className="text-lg md:text-xl leading-relaxed text-foreground/90 italic mb-8 relative z-10">
        "{quote}"
      </p>
      
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border border-primary/30">
          <AvatarFallback className="bg-background text-primary font-heading">
            {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-heading font-medium">{name}</div>
          <div className="text-sm text-primary uppercase tracking-wider">{location}</div>
        </div>
      </div>
    </div>
  );
}
