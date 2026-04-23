import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionTitle({ eyebrow, title, subtitle, centered = false, className }: SectionTitleProps) {
  return (
    <div className={cn("flex flex-col gap-4 mb-12 md:mb-16", centered && "items-center text-center", className)}>
      {eyebrow && (
        <span className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mt-2 leading-relaxed">
          {subtitle}
        </p>
      )}
      <div className={cn("w-12 h-1 bg-primary mt-4", centered && "mx-auto")} />
    </div>
  );
}
