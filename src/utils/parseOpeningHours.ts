const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const DAY_LABELS: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

export interface DayRow {
  day: string;
  label: string;
  hours: string;
}

function expandDayRange(range: string): string[] {
  const parts = range.split("-");
  if (parts.length === 1) {
    return DAYS.includes(parts[0].trim()) ? [parts[0].trim()] : [];
  }
  const start = DAYS.indexOf(parts[0].trim());
  const end = DAYS.indexOf(parts[1].trim());
  if (start === -1 || end === -1) return [];
  if (start <= end) return DAYS.slice(start, end + 1);
  return [...DAYS.slice(start), ...DAYS.slice(0, end + 1)];
}

function formatTime(t: string): string {
  const [hStr, mStr] = t.trim().split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function formatTimeRange(range: string): string {
  const match = range.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return range.trim();
  return `${formatTime(match[1])} – ${formatTime(match[2])}`;
}

function parseOsmOpeningHours(raw: string): DayRow[] {
  const schedule: Record<string, string> = {};
  DAYS.forEach((d) => (schedule[d] = "Closed"));

  const cleaned = raw.replace(/"[^"]*"/g, "").replace(/\s+/g, " ").trim();
  const rules = cleaned.split(";").map((s) => s.trim()).filter(Boolean);

  for (const rule of rules) {
    if (
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(rule) &&
      !/\d{2}:\d{2}/.test(rule)
    )
      continue;
    if (/off$/i.test(rule) && !/\d{2}:\d{2}/.test(rule)) continue;

    const withoutSeason = rule.replace(/^[A-Z][a-z]+-[A-Z][a-z]+:\s*/i, "");
    const timeRangeMatch = withoutSeason.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
    if (!timeRangeMatch) continue;

    const formattedTimes = timeRangeMatch.map(formatTimeRange).join(", ");

    const firstTimeIdx = withoutSeason.search(/\d{1,2}:\d{2}/);
    const dayPart =
      firstTimeIdx > 0
        ? withoutSeason.slice(0, firstTimeIdx).trim().replace(/[,\s]+$/, "")
        : "";

    let targetDays: string[] = [];
    if (!dayPart) {
      targetDays = [...DAYS];
    } else {
      for (const seg of dayPart.split(",").map((s) => s.trim())) {
        targetDays.push(...expandDayRange(seg));
      }
    }

    for (const day of targetDays) {
      if (DAYS.includes(day)) schedule[day] = formattedTimes;
    }
  }

  return DAYS.map((d) => ({ day: d, label: DAY_LABELS[d], hours: schedule[d] }));
}

/** weekdayText[0] may be a raw OSM `opening_hours` string, or (legacy Google
 * data) a pre-formatted "Monday: 9 AM – 5 PM" line per entry. Detects which
 * and returns one row per day of the week, Monday first. */
export function parseWeekdayRows(weekdayText: string[]): DayRow[] {
  const raw = weekdayText[0] ?? "";
  const isGoogleFormat =
    /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/i.test(raw);

  if (isGoogleFormat) {
    return weekdayText.map((line) => {
      const colonIdx = line.indexOf(":");
      const label = colonIdx > -1 ? line.slice(0, colonIdx) : line;
      const hours = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : "Closed";
      const dayCode = DAYS.find((d) => DAY_LABELS[d] === label) ?? label.slice(0, 2);
      return { day: dayCode, label, hours };
    });
  }

  return parseOsmOpeningHours(raw);
}

export function todayDayCode(): string {
  const jsDay = new Date().getDay();
  return DAYS[jsDay === 0 ? 6 : jsDay - 1];
}
