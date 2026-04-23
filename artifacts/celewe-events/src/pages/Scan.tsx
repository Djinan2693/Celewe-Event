import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Scan } from "lucide-react";

interface TicketData {
  valid: boolean;
  ticket?: {
    code: string;
    status: string;
    holderName: string;
    holderEmail: string;
    eventTitle: string;
    usedAt: string | null;
    createdAt: string;
  };
  error?: string;
}

export function ScanPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const code = params.get("code")?.trim().toUpperCase() ?? "";
  const [data, setData] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Ticket Verification — Céléwé Events";
  }, []);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);
    fetch(`/api/tickets/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((d: TicketData) => setData(d))
      .catch(() => setError("Network error — please try again"))
      .finally(() => setLoading(false));
  }, [code]);

  const statusColor = data?.valid
    ? "text-green-400"
    : data
    ? "text-red-500"
    : "text-white/40";

  const StatusIcon = data?.valid
    ? CheckCircle2
    : data
    ? XCircle
    : AlertCircle;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-widest mb-4">
            <Scan size={14} />
            Ticket Verification
          </div>
          <h1 className="font-heading text-3xl text-white">Entrance Scanner</h1>
        </motion.div>

        {!code && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card border border-border/50 p-8 text-center"
          >
            <AlertCircle size={36} className="text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-sm">No ticket code provided.</p>
            <p className="text-white/30 text-xs mt-2">Scan a ticket QR code to verify it.</p>
          </motion.div>
        )}

        {code && loading && (
          <div className="bg-card border border-border/50 p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Verifying ticket...</p>
            <p className="text-white/30 text-xs mt-1 font-mono">{code}</p>
          </div>
        )}

        {code && error && (
          <div className="bg-card border border-red-900/50 p-8 text-center">
            <XCircle size={40} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {code && data && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`bg-card border p-8 ${
              data.valid ? "border-green-800/50" : "border-red-900/50"
            }`}
          >
            <div className="text-center mb-6">
              <StatusIcon size={52} className={`${statusColor} mx-auto mb-3`} />
              <p className={`font-heading text-2xl ${statusColor}`}>
                {data.valid ? "Valid Ticket" : data.ticket?.status === "USED" ? "Already Used" : "Invalid Ticket"}
              </p>
              <p className="text-white/30 text-xs font-mono mt-2">{code}</p>
            </div>

            {data.ticket && (
              <div className="space-y-3 border-t border-white/10 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 uppercase tracking-wider text-xs">Event</span>
                  <span className="text-white font-medium">{data.ticket.eventTitle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 uppercase tracking-wider text-xs">Guest</span>
                  <span className="text-white">{data.ticket.holderName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 uppercase tracking-wider text-xs">Email</span>
                  <span className="text-white/70 text-xs">{data.ticket.holderEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40 uppercase tracking-wider text-xs">Status</span>
                  <span className={`font-medium uppercase text-xs tracking-wider ${statusColor}`}>
                    {data.ticket.status}
                  </span>
                </div>
                {data.ticket.usedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40 uppercase tracking-wider text-xs">Used At</span>
                    <span className="text-white/50 text-xs">
                      {new Date(data.ticket.usedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {data.valid && (
              <button
                onClick={async () => {
                  await fetch(`/api/tickets/${encodeURIComponent(code)}/use`, { method: "POST" });
                  const r = await fetch(`/api/tickets/${encodeURIComponent(code)}`);
                  setData(await r.json());
                }}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 text-sm uppercase tracking-widest transition-colors"
              >
                Mark as Used
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
