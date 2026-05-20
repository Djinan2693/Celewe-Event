import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" description="This page doesn't exist." noIndex />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-6">404</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white mb-4 leading-none">
            Lost in<br />the night.
          </h1>
          <p className="text-white/40 text-lg mb-10 leading-relaxed">
            This page doesn't exist — or maybe it's on the VIP list and you're not.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-sm uppercase tracking-widest transition-colors">
                <ArrowLeft size={16} />
                Back to Home
              </button>
            </Link>
            <Link href="/events">
              <button className="border border-white/20 hover:border-white/50 text-white/60 hover:text-white px-8 py-4 text-sm uppercase tracking-widest transition-all">
                Browse Events
              </button>
            </Link>
          </div>
          <div className="mt-16 border-t border-white/8 pt-8">
            <p className="text-white/15 text-xs tracking-widest uppercase">Cèlewé Events — Crafting Moments that Matter</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
