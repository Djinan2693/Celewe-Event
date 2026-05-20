import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Search,
  CheckCircle2,
  Clock,
  Ticket,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface AdminTicket {
  id: string;
  ticketCode: string;
  holderName: string;
  holderEmail: string;
  eventTitle: string;
  eventId: string;
  status: string;
  createdAt: string;
  usedAt: string | null;
}

const SESSION_KEY = "cewe_admin_pw";

function StatusBadge({ status }: { status: string }) {
  const used = status === "USED";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
        used
          ? "bg-green-900/40 text-green-400 border border-green-800/60"
          : "bg-primary/15 text-primary border border-primary/30"
      }`}
    >
      {used ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {status}
    </span>
  );
}

export function AdminPage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Staff Dashboard — Cèlewé Events";
  }, []);

  useEffect(() => {
    if (authed) {
      fetchTickets();
      searchRef.current?.focus();
    }
  }, [authed]);

  async function fetchTickets(q?: string) {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({ password });
    if (q) params.set("search", q);
    try {
      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      if (res.status === 401) {
        setAuthed(false);
        setAuthError(true);
        sessionStorage.removeItem(SESSION_KEY);
        return;
      }
      const data = (await res.json()) as { tickets: AdminTicket[]; total: number };
      setTickets(data.tickets);
      setLastRefresh(new Date());
    } catch {
      setFetchError("Network error — cannot reach server");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    const params = new URLSearchParams({ password });
    try {
      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      if (res.status === 401) {
        setAuthError(true);
        return;
      }
      const data = (await res.json()) as { tickets: AdminTicket[]; total: number };
      setTickets(data.tickets);
      setLastRefresh(new Date());
      sessionStorage.setItem(SESSION_KEY, password);
      setAuthed(true);
    } catch {
      setFetchError("Network error — check your connection");
    }
  }

  function handleSearch(val: string) {
    setSearch(val);
    fetchTickets(val || undefined);
  }

  function logout() {
    setAuthed(false);
    setPassword("");
    sessionStorage.removeItem(SESSION_KEY);
    setTickets([]);
  }

  const validated = tickets.filter((t) => t.status === "USED");
  const pending = tickets.filter((t) => t.status !== "USED");

  if (!authed) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/15 border border-primary/30 mb-4">
              <Lock size={22} className="text-primary" />
            </div>
            <h1 className="font-heading text-2xl text-white">Staff Dashboard</h1>
            <p className="text-white/35 text-xs mt-1 uppercase tracking-wider">Restricted Access</p>
          </div>

          <form onSubmit={handleLogin} className="bg-card border border-border/50 p-6">
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError(false);
              }}
              placeholder="Enter password"
              className={`w-full bg-background border px-4 py-3 text-white text-sm outline-none focus:border-primary/60 transition-colors mb-1 ${
                authError ? "border-red-700" : "border-border/60"
              }`}
            />
            {authError && (
              <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
                <AlertCircle size={11} /> Incorrect password
              </p>
            )}
            {fetchError && (
              <p className="text-red-400 text-xs mb-3">{fetchError}</p>
            )}
            <button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-3 text-sm uppercase tracking-widest font-medium transition-colors"
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-primary text-xs uppercase tracking-[0.2em] mb-1">Staff Dashboard</p>
            <h1 className="font-heading text-3xl text-white">Ticket Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTickets(search || undefined)}
              disabled={loading}
              className="p-2 border border-border/50 hover:border-white/30 text-white/40 hover:text-white/70 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-border/50 hover:border-white/30 text-white/40 hover:text-white/70 text-xs uppercase tracking-wider transition-colors"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Total Tickets", value: tickets.length, color: "text-white" },
            { label: "Validated", value: validated.length, color: "text-green-400" },
            { label: "Pending", value: pending.length, color: "text-primary" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border/50 p-4 text-center">
              <p className={`font-heading text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-white/35 text-xs uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by code, name or email…"
            className="w-full bg-card border border-border/50 focus:border-primary/50 pl-10 pr-4 py-3 text-white text-sm outline-none placeholder:text-white/25 transition-colors"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {lastRefresh && (
          <p className="text-white/20 text-xs mb-4 text-right">
            Last updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}

        {fetchError && (
          <div className="bg-red-950/40 border border-red-900/50 p-4 text-red-400 text-sm mb-6 flex items-center gap-2">
            <AlertCircle size={16} /> {fetchError}
          </div>
        )}

        {/* Ticket List */}
        <AnimatePresence mode="popLayout">
          {tickets.length === 0 && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border/50 p-12 text-center"
            >
              <Ticket size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">
                {search ? "No tickets match your search." : "No tickets found yet."}
              </p>
            </motion.div>
          )}

          {tickets.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-start justify-between gap-4 bg-card border-b border-border/30 px-5 py-4 hover:bg-white/[0.02] transition-colors ${
                i === 0 ? "border-t border-border/30" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-sm font-semibold text-white tracking-wider">
                    {t.ticketCode}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-white/70 text-sm truncate">{t.holderName}</p>
                <p className="text-white/30 text-xs truncate">{t.holderEmail}</p>
                <p className="text-white/25 text-xs mt-1 truncate">{t.eventTitle}</p>
              </div>

              <div className="text-right shrink-0">
                {t.usedAt ? (
                  <div>
                    <p className="text-green-400 text-xs font-medium">
                      {new Date(t.usedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-white/25 text-[10px]">
                      {new Date(t.usedAt).toLocaleDateString([], { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/25 text-xs">
                    {new Date(t.createdAt).toLocaleDateString([], { day: "2-digit", month: "short" })}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
