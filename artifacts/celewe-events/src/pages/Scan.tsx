import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useSearch } from "wouter";
import { AlertCircle, CheckCircle2, TicketX } from "lucide-react";

type VerifyResponse = {
  status: "VALID" | "USED" | "NOT_FOUND";
  ticketCode: string;
  event?: {
    title: string;
    dateISO: string;
    venue: string;
  };
  usedAt?: string;
};

type ScreenState =
  | { kind: "idle" }
  | { kind: "loading"; code: string }
  | { kind: "loaded"; result: VerifyResponse }
  | { kind: "error"; message: string };

type AudioContextCtor = typeof AudioContext;

const STATUS_STYLES: Record<
  VerifyResponse["status"],
  {
    ring: string;
    text: string;
    panel: string;
    icon: ReactNode;
    title: string;
    subtitle: string;
  }
> = {
  VALID: {
    ring: "border-emerald-500/40",
    text: "text-emerald-400",
    panel: "bg-emerald-500/10",
    icon: <CheckCircle2 className="h-16 w-16 text-emerald-400" />,
    title: "VALID",
    subtitle: "Ticket is valid for entry.",
  },
  USED: {
    ring: "border-red-500/40",
    text: "text-red-400",
    panel: "bg-red-500/10",
    icon: <TicketX className="h-16 w-16 text-red-400" />,
    title: "USED",
    subtitle: "This ticket has already been used.",
  },
  NOT_FOUND: {
    ring: "border-red-500/40",
    text: "text-red-400",
    panel: "bg-red-500/10",
    icon: <AlertCircle className="h-16 w-16 text-red-400" />,
    title: "NOT_FOUND",
    subtitle: "No ticket matches this code.",
  },
};

function formatDate(dateISO: string) {
  return new Date(dateISO).toLocaleString([], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAudioContextCtor(): AudioContextCtor | null {
  const webkitCtor = (window as Window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return window.AudioContext ?? webkitCtor ?? null;
}

function playStatusTone(status: VerifyResponse["status"]) {
  const AudioCtx = getAudioContextCtor();

  if (!AudioCtx) {
    return;
  }

  const context = new AudioCtx();
  const now = context.currentTime;

  function beep(frequency: number, start: number, duration: number, gainValue: number) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  if (status === "VALID") {
    beep(880, now, 0.13, 0.12);
    beep(1047, now + 0.17, 0.13, 0.12);
  } else {
    beep(220, now, 0.2, 0.12);
    beep(165, now + 0.24, 0.22, 0.14);
  }

  window.setTimeout(() => {
    context.close().catch(() => {
      return;
    });
  }, 900);
}

export function ScanPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const code = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("code")?.trim().toUpperCase() ?? "";
  }, [search]);

  const [state, setState] = useState<ScreenState>(code ? { kind: "loading", code } : { kind: "idle" });
  const [autoNext, setAutoNext] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [staffPin, setStaffPin] = useState("");
  const [agentName, setAgentName] = useState("");
  const [useLoading, setUseLoading] = useState(false);
  const [useError, setUseError] = useState<string | null>(null);

  useEffect(() => {
    document.title = code ? `Scan ${code} | Celewe Events` : "Scan | Celewe Events";
  }, [code]);

  useEffect(() => {
    if (!code) {
      setState({ kind: "idle" });
      return;
    }

    let cancelled = false;
    setState({ kind: "loading", code });

    fetch(`/api/tickets/verify?code=${encodeURIComponent(code)}`)
      .then(async (response) => {
        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Unable to verify ticket");
        }

        return response.json() as Promise<VerifyResponse>;
      })
      .then((result) => {
        if (!cancelled) {
          setState({ kind: "loaded", result });
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ kind: "error", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!autoNext) {
      return;
    }

    if (state.kind !== "loaded" && state.kind !== "error") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLocation("/scan");
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoNext, setLocation, state.kind]);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    if (state.kind !== "loaded") {
      return;
    }

    playStatusTone(state.result.status);
  }, [soundEnabled, state]);

  async function handleMarkUsed() {
    if (state.kind !== "loaded") {
      return;
    }

    const codeToUse = state.result.ticketCode;

    if (!staffPin.trim()) {
      setUseError("Staff PIN is required.");
      return;
    }

    setUseLoading(true);
    setUseError(null);

    try {
      const response = await fetch("/api/tickets/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToUse,
          pin: staffPin.trim(),
          agentName: agentName.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as VerifyResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to mark ticket as used");
      }

      setState({ kind: "loaded", result: payload });
      setStaffPin("");
    } catch (error) {
      setUseError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setUseLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#120d0e] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        {state.kind === "idle" && (
          <div className="w-full max-w-xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
            <AlertCircle className="mx-auto mb-5 h-14 w-14 text-white/50" />
            <h1 className="font-heading text-4xl text-white">Ticket Scan</h1>
            <p className="mt-4 text-sm text-white/65">Open this page with a code query parameter to verify a ticket.</p>
            <p className="mt-2 text-xs text-white/45">Example: /scan?code=CE-FK-000001-ABCD</p>
          </div>
        )}

        {state.kind === "loading" && (
          <div className="w-full max-w-xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <h1 className="font-heading text-4xl text-white">Checking Ticket</h1>
            <p className="mt-4 font-mono text-sm text-white/55">{state.code}</p>
          </div>
        )}

        {state.kind === "error" && (
          <div className="w-full max-w-xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl">
            <AlertCircle className="mx-auto mb-5 h-14 w-14 text-red-400" />
            <h1 className="font-heading text-4xl text-red-400">Error</h1>
            <p className="mt-4 text-sm text-white/70">{state.message}</p>
            <button
              onClick={() => setLocation("/scan")}
              className="mt-6 border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/75 transition hover:border-white/40 hover:text-white"
            >
              Scan Next
            </button>
          </div>
        )}

        {state.kind === "loaded" && (() => {
          const styles = STATUS_STYLES[state.result.status];

          return (
            <div className={`w-full max-w-2xl border ${styles.ring} ${styles.panel} p-8 shadow-2xl sm:p-10`}>
              <div className="flex flex-col items-center text-center">
                {styles.icon}
                <p className={`mt-6 text-xs font-semibold tracking-[0.35em] ${styles.text}`}>TICKET STATUS</p>
                <h1 className={`mt-3 font-heading text-5xl ${styles.text}`}>{styles.title}</h1>
                <p className="mt-4 text-base text-white/75">{styles.subtitle}</p>
                <p className="mt-6 rounded-full border border-white/10 px-4 py-2 font-mono text-sm text-white/70">
                  {state.result.ticketCode}
                </p>
              </div>

              {state.result.event && (
                <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Event</p>
                    <p className="mt-2 text-sm text-white">{state.result.event.title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Date</p>
                    <p className="mt-2 text-sm text-white">{formatDate(state.result.event.dateISO)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Venue</p>
                    <p className="mt-2 text-sm text-white">{state.result.event.venue}</p>
                  </div>
                </div>
              )}

              {state.result.status === "USED" && state.result.usedAt && (
                <div className="mt-6 border-t border-white/10 pt-6 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Used At</p>
                  <p className="mt-2 text-sm text-white">{formatDate(state.result.usedAt)}</p>
                </div>
              )}

              {state.result.status === "VALID" && (
                <div className="mt-6 border-t border-white/10 pt-6 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/40">Ticket QR</p>
                  <img
                    src={`/api/tickets/qr?code=${encodeURIComponent(state.result.ticketCode)}`}
                    alt={`QR for ${state.result.ticketCode}`}
                    className="mx-auto mt-4 h-44 w-44 rounded border border-white/20 bg-white p-2"
                  />

                  <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/40">Staff Validation</p>
                    <input
                      value={agentName}
                      onChange={(event) => setAgentName(event.target.value)}
                      placeholder="Agent name (optional)"
                      className="w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <input
                      type="password"
                      value={staffPin}
                      onChange={(event) => setStaffPin(event.target.value)}
                      placeholder="Staff PIN"
                      className="w-full border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40"
                    />
                    <button
                      onClick={handleMarkUsed}
                      disabled={useLoading}
                      className="w-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {useLoading ? "Marking..." : "Mark As Used"}
                    </button>
                    {useError && <p className="text-xs text-red-300">{useError}</p>}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center gap-4 border-t border-white/10 pt-6">
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/65">
                  <input
                    type="checkbox"
                    checked={autoNext}
                    onChange={(event) => setAutoNext(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Auto next scan (3.5s)
                </label>
                <label className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/65">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(event) => setSoundEnabled(event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Sound feedback
                </label>
                <button
                  onClick={() => setLocation("/scan")}
                  className="border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-white/75 transition hover:border-white/40 hover:text-white"
                >
                  Scan Next
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
