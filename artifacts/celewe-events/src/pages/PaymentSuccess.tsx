import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Ticket, Mail, ArrowRight } from "lucide-react";

export function PaymentSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const transactionId = params.get("_ptxn") ?? params.get("transaction_id");
  const [count, setCount] = useState(5);

  useEffect(() => {
    document.title = "Payment Confirmed — Cèlewé Events";
  }, []);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="mx-auto mb-8 w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center"
        >
          <CheckCircle2 size={44} className="text-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-primary text-xs uppercase tracking-[0.25em] mb-4">Payment Confirmed</p>
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-4 leading-tight">
            You&apos;re on the list.
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Your ticket has been secured. Check your inbox — we&apos;ve sent your ticket with a QR code to your email address.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-card border border-border/50 p-5 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} className="text-primary" />
                <span className="text-white/80 text-sm font-medium">Email Sent</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Your ticket QR code has been sent to your email. Check your spam folder if you don&apos;t see it.
              </p>
            </div>
            <div className="bg-card border border-border/50 p-5 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Ticket size={18} className="text-primary" />
                <span className="text-white/80 text-sm font-medium">At the Entrance</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed">
                Present your QR code or ticket code at the door. Our team will scan and verify your ticket instantly.
              </p>
            </div>
          </div>

          {transactionId && (
            <p className="text-white/25 text-xs font-mono mb-8">
              Transaction: {transactionId}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events">
              <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 text-sm uppercase tracking-widest transition-colors">
                Browse More Events
                <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/">
              <button className="border border-white/20 hover:border-white/50 text-white/70 hover:text-white px-8 py-4 text-sm uppercase tracking-widest transition-all">
                Back to Home
              </button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <p className="text-white/20 text-xs tracking-widest uppercase">
            Crafting Moments that Matter — Cèlewé Events
          </p>
        </motion.div>
      </div>
    </div>
  );
}
