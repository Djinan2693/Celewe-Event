import { useEffect, useRef, useState } from "react";
import { useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ScanLine,
  Delete,
  ShieldCheck,
} from "lucide-react";

type Stage =
  | "idle"
  | "loading"
  | "valid"
  | "used"
  | "notfound"
  | "pin"
  | "validating"
  | "validated"
  | "pinerror";

interface TicketInfo {
  code: string;
  status: string;
  holderName: string;
  holderEmail: string;
  eventTitle: string;
  usedAt: string | null;
  createdAt: string;
}

const PIN_LENGTH = 6;

export function ScanPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const code = params.get("code")?.trim().toUpperCase() ?? "";

  const [stage, setStage] = useState<Stage>(code ? "loading" : "idle");
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [validatedAt, setValidatedAt] = useState<Date | null>(null);
  const shakeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.title = "Entrance Scanner — Cèlewé Events";
  }, []);

  useEffect(() => {
    if (!code) return;
    setStage("loading");
    fetch(`/api/tickets/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d: { valid: boolean; ticket?: TicketInfo; error?: string }) => {
        if (!d.ticket) {
          setStage("notfound");
          return;
        }
        setTicket(d.ticket);
        setStage(d.valid ? "valid" : "used");
      })
      .catch(() => {
        setFetchError("Network error — check your connection");
        setStage("notfound");
      });
  }, [code]);

  function pressPin(digit: string) {
    if (pin.length >= PIN_LENGTH) return;
    setPin((p) => p + digit);
    setPinError(false);
  }

  function backspacePin() {
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  }

  async function submitPin() {
    if (pin.length === 0) return;
    setStage("validating");
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        ticket?: TicketInfo;
        error?: string;
        status?: string;
      };

      if (res.ok && data.success && data.ticket) {
        setTicket(data.ticket);
        setValidatedAt(new Date());
        setStage("validated");
      } else if (res.status === 401) {
        setPinError(true);
        setPin("");
        setStage("pin");
        if (shakeRef.current) clearTimeout(shakeRef.current);
        shakeRef.current = setTimeout(() => setPinError(false), 800);
      } else if (res.status === 409) {
        setStage("used");
      } else {
        setFetchError(data.error ?? "Unexpected error");
        setStage("notfound");
      }
    } catch {
      setFetchError("Network error — check your connection");
      setStage("notfound");
    }
  }

  const KEYPAD_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-primary/70 text-xs uppercase tracking-[0.25em] mb-2">
            <ScanLine size={13} />
            Entrance Scanner
          </div>
          <h1 className="font-heading text-2xl text-white">Cèlewé Events</h1>
        </div>

        <AnimatePresence mode="wait">
          {stage === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border/50 p-10 text-center"
            >
              <ScanLine size={40} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 text-sm">No ticket code provided.</p>
              <p className="text-white/25 text-xs mt-2">Scan a QR code to begin.</p>
            </motion.div>
          )}

          {stage === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border/50 p-10 text-center"
            >
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/50 text-sm">Verifying ticket…</p>
              <p className="text-white/30 text-xs mt-1 font-mono">{code}</p>
            </motion.div>
          )}

          {(stage === "notfound") && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-red-900/60 p-8 text-center"
            >
              <XCircle size={52} className="text-red-500 mx-auto mb-4" />
              <p className="font-heading text-2xl text-red-400 mb-2">Not Found</p>
              <p className="text-white/30 text-xs font-mono mb-3">{code || "—"}</p>
              <p className="text-red-400/60 text-sm">{fetchError ?? "This ticket code does not exist."}</p>
            </motion.div>
          )}

          {stage === "used" && ticket && (
            <motion.div
              key="used"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-orange-900/60 p-8 text-center"
            >
              <XCircle size={52} className="text-orange-400 mx-auto mb-4" />
              <p className="font-heading text-2xl text-orange-400 mb-1">Already Used</p>
              <p className="text-white/30 text-xs font-mono mb-5">{ticket.code}</p>
              <div className="space-y-2 text-sm border-t border-white/10 pt-5">
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Guest</span>
                  <span className="text-white">{ticket.holderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Event</span>
                  <span className="text-white text-right max-w-[60%]">{ticket.eventTitle}</span>
                </div>
                {ticket.usedAt && (
                  <div className="flex justify-between">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Validated</span>
                    <span className="text-orange-400/80 text-xs">
                      {new Date(ticket.usedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {stage === "valid" && ticket && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-green-900/50"
            >
              <div className="p-8 text-center border-b border-white/10">
                <CheckCircle2 size={52} className="text-green-400 mx-auto mb-3" />
                <p className="font-heading text-2xl text-green-400 mb-1">Valid Ticket</p>
                <p className="text-white/30 text-xs font-mono">{ticket.code}</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Guest</span>
                  <span className="text-white font-medium">{ticket.holderName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Email</span>
                  <span className="text-white/60 text-xs">{ticket.holderEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Event</span>
                  <span className="text-white text-right text-xs max-w-[55%]">{ticket.eventTitle}</span>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setPin("");
                    setPinError(false);
                    setStage("pin");
                  }}
                  className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white py-4 text-sm uppercase tracking-widest font-medium transition-colors"
                >
                  Validate Entry
                </button>
              </div>
            </motion.div>
          )}

          {(stage === "pin" || stage === "validating") && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 10 }}
              animate={pinError ? { opacity: 1, x: [0, -8, 8, -8, 8, 0] } : { opacity: 1, x: 0 }}
              transition={pinError ? { duration: 0.4 } : { duration: 0.3 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border/50"
            >
              <div className="p-6 border-b border-white/10 text-center">
                <ShieldCheck size={22} className="text-primary mx-auto mb-2" />
                <p className="font-heading text-lg text-white">Staff PIN Required</p>
                <p className="text-white/35 text-xs mt-1">Enter your PIN to validate entry</p>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center gap-3 mb-6 h-12">
                  {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-150 ${
                        i < pin.length
                          ? pinError
                            ? "bg-red-500 scale-110"
                            : "bg-primary scale-110"
                          : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-red-400 text-xs text-center mb-4 uppercase tracking-wider">
                    Incorrect PIN — try again
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {KEYPAD_ROWS.map((row, ri) =>
                    row.map((key, ki) => {
                      if (!key) return <div key={`${ri}-${ki}`} />;
                      const isBackspace = key === "⌫";
                      return (
                        <button
                          key={`${ri}-${ki}`}
                          disabled={stage === "validating"}
                          onClick={() => (isBackspace ? backspacePin() : pressPin(key))}
                          className={`h-14 text-lg font-medium transition-all active:scale-95 select-none
                            ${isBackspace
                              ? "text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10"
                              : "text-white bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25"
                            } disabled:opacity-40`}
                        >
                          {isBackspace ? <Delete size={18} className="mx-auto" /> : key}
                        </button>
                      );
                    }),
                  )}
                </div>

                <button
                  disabled={pin.length === 0 || stage === "validating"}
                  onClick={submitPin}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-white text-sm uppercase tracking-widest font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {stage === "validating" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Validating…
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </button>

                <button
                  onClick={() => setStage("valid")}
                  disabled={stage === "validating"}
                  className="w-full mt-3 py-3 text-white/30 hover:text-white/60 text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {stage === "validated" && ticket && (
            <motion.div
              key="validated"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className="bg-green-600 text-white text-center py-12 px-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
              >
                <CheckCircle2 size={72} className="mx-auto mb-5 text-white drop-shadow-lg" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-heading text-4xl font-bold mb-1 tracking-wide">ENTRY</p>
                <p className="font-heading text-4xl font-bold tracking-wide mb-6">VALIDATED</p>

                <div className="inline-block bg-green-700/60 border border-white/20 px-5 py-2 mb-6">
                  <p className="font-mono text-xl tracking-[0.2em] font-bold">{ticket.code}</p>
                </div>

                <div className="space-y-2 text-green-100/90 text-sm">
                  <p className="text-white font-medium text-lg">{ticket.holderName}</p>
                  <p className="text-green-200/70 text-xs">{ticket.eventTitle}</p>
                  {validatedAt && (
                    <p className="text-green-200/50 text-xs font-mono mt-3">
                      {validatedAt.toLocaleDateString()} &nbsp;·&nbsp;{" "}
                      {validatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    window.location.href = "/scan";
                  }}
                  className="mt-8 bg-white/20 hover:bg-white/30 border border-white/30 text-white px-8 py-3 text-xs uppercase tracking-widest transition-colors"
                >
                  Scan Next
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
