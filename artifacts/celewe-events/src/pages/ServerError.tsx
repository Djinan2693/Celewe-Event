import { Link } from "wouter";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { SEO } from "@/components/SEO";

export function ServerError() {
  return (
    <>
      <SEO title="Something Went Wrong" description="An unexpected error occurred." noIndex />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <p className="text-primary text-xs uppercase tracking-[0.3em] mb-6">500</p>
          <h1 className="font-heading text-6xl md:text-8xl text-white mb-4 leading-none">
            The night<br />broke down.
          </h1>
          <p className="text-white/40 text-lg mb-10 leading-relaxed">
            Something went wrong on our end. Our team has been notified — please try again in a moment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-sm uppercase tracking-widest transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <Link href="/">
              <button className="border border-white/20 hover:border-white/50 text-white/60 hover:text-white px-8 py-4 text-sm uppercase tracking-widest transition-all">
                Go Home
              </button>
            </Link>
          </div>
          <div className="mt-16 border-t border-white/8 pt-8">
            <p className="text-white/15 text-xs tracking-widest uppercase">Céléwé Events — Crafting Moments that Matter</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
