import { useEffect, useState } from "react";
import {
  Lock,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  LogOut,
  AlertCircle,
  Ticket as TicketIcon,
} from "lucide-react";

interface Reservation {
  id: string;
  status: string;
  provider: string;
  eventTitle: string;
  eventSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qty: number;
  amountPHP: number;
  currency: string;
  ticketsIssued: number;
  createdAt: string;
}

const SESSION_KEY = "cewe_staff_pin";

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const paid = status === "PAID";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium ${
        paid
          ? "bg-green-900/40 text-green-400 border border-green-800/60"
          : "bg-amber-900/30 text-amber-400 border border-amber-800/50"
      }`}
    >
      {paid ? <CheckCircle2 size={10} /> : <Clock size={10} />}
      {paid ? "COMPLETED" : "PENDING"}
    </span>
  );
}

export function AdminReservations() {
  const [pin, setPin] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowMessage, setRowMessage] = useState<Record<string, { text: string; error: boolean }>>({});

  useEffect(() => {
    document.title = "Reservations — CÈLEWÉ Events";
  }, []);

  async function fetchReservations(all = showAll, currentPin = pin) {
    setLoading(true);
    setFetchError(null);
    const params = new URLSearchParams({ pin: currentPin });
    if (all) params.set("status", "all");
    try {
      const res = await fetch(`/api/admin/reservations?${params.toString()}`);
      if (res.status === 401) {
        setAuthed(false);
        setAuthError(true);
        sessionStorage.removeItem(SESSION_KEY);
        return false;
      }
      const data = (await res.json()) as { reservations: Reservation[] };
      setReservations(data.reservations ?? []);
      return true;
    } catch {
      setFetchError("Network error — cannot reach server");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(false);
    const ok = await fetchReservations(showAll, pin);
    if (ok) {
      sessionStorage.setItem(SESSION_KEY, pin);
      setAuthed(true);
    }
  }

  function logout() {
    setAuthed(false);
    setPin("");
    sessionStorage.removeItem(SESSION_KEY);
    setReservations([]);
  }

  async function confirmPayment(r: Reservation) {
    if (!window.confirm(`Confirm payment for ${r.firstName} ${r.lastName} (${r.qty} ticket${r.qty > 1 ? "s" : ""})? This issues the ticket(s) and emails them.`)) {
      return;
    }
    await runAction(r.id, `/api/admin/orders/${r.id}/confirm`, "Payment confirmed");
  }

  async function resendTicket(r: Reservation) {
    await runAction(r.id, `/api/admin/orders/${r.id}/resend`, "Ticket re-sent");
  }

  async function runAction(id: string, url: string, successLabel: string) {
    setBusyId(id);
    setRowMessage((prev) => ({ ...prev, [id]: { text: "Working…", error: false } }));
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; emailSent?: boolean; emailError?: string; alreadyConfirmed?: boolean; note?: string }
        | null;

      if (!res.ok || !data?.ok) {
        setRowMessage((prev) => ({
          ...prev,
          [id]: { text: data?.error ?? "Action failed", error: true },
        }));
        return;
      }

      let text = successLabel;
      if (data.alreadyConfirmed) text = data.note ?? "Already confirmed";
      else if (data.emailSent === false) {
        text = `${successLabel}, but email NOT sent${data.emailError ? `: ${data.emailError}` : ""}`;
      } else if (data.emailSent) {
        text = `${successLabel} — email sent ✓`;
      }
      setRowMessage((prev) => ({ ...prev, [id]: { text, error: data.emailSent === false } }));
      await fetchReservations();
    } catch {
      setRowMessage((prev) => ({ ...prev, [id]: { text: "Network error", error: true } }));
    } finally {
      setBusyId(null);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card border border-border/50 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-primary" />
            <h1 className="font-heading text-2xl">Staff Access</h1>
          </div>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Staff PIN"
            className="w-full bg-background border border-border/50 px-3 py-2 text-sm mb-3"
            autoFocus
          />
          {authError && (
            <p className="text-red-400 text-xs mb-3 flex items-center gap-1">
              <AlertCircle size={12} /> Invalid PIN
            </p>
          )}
          {fetchError && <p className="text-red-400 text-xs mb-3">{fetchError}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 text-sm uppercase tracking-widest"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-[1100px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-heading text-3xl flex items-center gap-2">
            <TicketIcon size={22} className="text-primary" /> Reservations
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !showAll;
                setShowAll(next);
                fetchReservations(next);
              }}
              className="text-xs border border-border/50 px-3 py-2 hover:border-white"
            >
              {showAll ? "Show pending only" : "Show all"}
            </button>
            <button
              onClick={() => fetchReservations()}
              className="text-xs border border-border/50 px-3 py-2 hover:border-white flex items-center gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={logout}
              className="text-xs border border-border/50 px-3 py-2 hover:border-white flex items-center gap-1"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {fetchError && <p className="text-red-400 text-sm mb-4">{fetchError}</p>}

        {reservations.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/40 text-muted-foreground">
            {loading ? "Loading…" : "No reservations."}
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => {
              const issued = r.ticketsIssued > 0;
              const msg = rowMessage[r.id];
              return (
                <div key={r.id} className="border border-border/50 bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">
                          {r.firstName} {r.lastName}
                        </span>
                        <StatusBadge status={r.status} />
                        {issued && (
                          <span className="text-[10px] text-green-400 uppercase tracking-wider">
                            {r.ticketsIssued} ticket{r.ticketsIssued > 1 ? "s" : ""} issued
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-0.5">
                        <div>{r.eventTitle} · {r.qty} × · {r.currency} {r.amountPHP.toLocaleString()}</div>
                        <div>{r.email} · {r.phone}</div>
                        <div className="text-xs text-muted-foreground/70">{formatDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!issued ? (
                        <button
                          onClick={() => confirmPayment(r)}
                          disabled={busyId === r.id}
                          className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 size={14} /> Confirm & send
                        </button>
                      ) : (
                        <button
                          onClick={() => resendTicket(r)}
                          disabled={busyId === r.id}
                          className="border border-border/50 hover:border-white text-white text-xs px-4 py-2 uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
                        >
                          <Send size={14} /> Resend ticket
                        </button>
                      )}
                      {msg && (
                        <span className={`text-xs text-right max-w-[260px] ${msg.error ? "text-red-400" : "text-green-400"}`}>
                          {msg.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
