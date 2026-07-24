// Human-friendly date/time labels for events, used in emails. The billable
// amount always comes from the database (event.pricePHP), never from here.

const EVENT_DISPLAY: Record<string, { dateLabel: string; timeLabel: string }> = {
  "deja-vu-party": {
    dateLabel: "August 29, 2026",
    timeLabel: "7:00 PM – 2:00 AM",
  },
  "french-kiss-night": {
    dateLabel: "April 4, 2026",
    timeLabel: "10:00 PM – 4:00 AM",
  },
};

function fallbackDateLabel(dateISO: string) {
  const parsed = new Date(dateISO);
  if (Number.isNaN(parsed.getTime())) {
    return dateISO;
  }
  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila",
  });
}

export function getEventLabels(eventSlug: string, dateISO: string) {
  const display = EVENT_DISPLAY[eventSlug];
  return {
    dateLabel: display?.dateLabel ?? fallbackDateLabel(dateISO),
    timeLabel: display?.timeLabel ?? "",
  };
}
