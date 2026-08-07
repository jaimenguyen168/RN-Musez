const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function expandDayRange(range: string): string[] {
  const parts = range.split("-");
  if (parts.length === 1) {
    return DAYS.includes(parts[0].trim()) ? [parts[0].trim()] : [];
  }
  const start = DAYS.indexOf(parts[0].trim());
  const end = DAYS.indexOf(parts[1].trim());
  if (start === -1 || end === -1) return [];
  if (start <= end) return DAYS.slice(start, end + 1);
  // wrap-around e.g. "Su-Sa" = all days
  return [...DAYS.slice(start), ...DAYS.slice(0, end + 1)];
}

/**
 * Parses an OSM opening_hours string and returns true if the current local
 * time falls within an open window for today.
 *
 * Supports: "Mo-Fr 09:00-17:00; Sa 10:00-15:00", "09:00-18:00" (no day = all
 * days), comma-separated day groups "Sa,Su 11:00-16:00", wrap-around midnight
 * "22:00-02:00", and seasonal/holiday exception rules (skipped).
 */
export function isOpenNow(raw: string | undefined | null): boolean {
  if (!raw) return false;

  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday
  const todayCode = DAYS[jsDay === 0 ? 6 : jsDay - 1];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const cleaned = raw.replace(/"[^"]*"/g, "").replace(/\s+/g, " ").trim();
  const rules = cleaned.split(";").map((s) => s.trim()).filter(Boolean);

  for (const rule of rules) {
    // Skip holiday/seasonal exceptions that have no time component
    if (
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(rule) &&
      !/\d{1,2}:\d{2}/.test(rule)
    )
      continue;
    if (/off$/i.test(rule) && !/\d{1,2}:\d{2}/.test(rule)) continue;

    // Strip seasonal prefix like "Apr-Dec:"
    const withoutSeason = rule.replace(/^[A-Z][a-z]+-[A-Z][a-z]+:\s*/i, "");

    // Find all HH:MM-HH:MM time ranges in this rule
    const timeRanges = [
      ...withoutSeason.matchAll(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g),
    ];
    if (!timeRanges.length) continue;

    // Day portion is everything before the first time token
    const firstTimeIdx = withoutSeason.search(/\d{1,2}:\d{2}/);
    const dayPart =
      firstTimeIdx > 0
        ? withoutSeason.slice(0, firstTimeIdx).trim().replace(/[,\s]+$/, "")
        : "";

    let targetDays: string[];
    if (!dayPart) {
      targetDays = [...DAYS];
    } else {
      targetDays = [];
      for (const seg of dayPart.split(",").map((s) => s.trim())) {
        targetDays.push(...expandDayRange(seg));
      }
    }

    if (!targetDays.includes(todayCode)) continue;

    for (const match of timeRanges) {
      const [openH, openM] = match[1].split(":").map(Number);
      const [closeH, closeM] = match[2].split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;
      // Handle past-midnight close e.g. 22:00-02:00
      if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes)
        return true;
    }
  }

  return false;
}

export type OpenStatus = "open" | "closing-soon" | "closed" | "unknown";

const CLOSING_SOON_THRESHOLD_MIN = 30;

/**
 * Like `isOpenNow`, but distinguishes "closing soon" (within 30 minutes of
 * close) from a plain "open", and reports "unknown" when no hours are
 * published at all (as opposed to "closed").
 */
export function getOpenStatus(raw: string | undefined | null): OpenStatus {
  if (!raw) return "unknown";

  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday
  const todayCode = DAYS[jsDay === 0 ? 6 : jsDay - 1];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const cleaned = raw.replace(/"[^"]*"/g, "").replace(/\s+/g, " ").trim();
  const rules = cleaned.split(";").map((s) => s.trim()).filter(Boolean);

  for (const rule of rules) {
    if (
      /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(rule) &&
      !/\d{1,2}:\d{2}/.test(rule)
    )
      continue;
    if (/off$/i.test(rule) && !/\d{1,2}:\d{2}/.test(rule)) continue;

    const withoutSeason = rule.replace(/^[A-Z][a-z]+-[A-Z][a-z]+:\s*/i, "");

    const timeRanges = [
      ...withoutSeason.matchAll(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/g),
    ];
    if (!timeRanges.length) continue;

    const firstTimeIdx = withoutSeason.search(/\d{1,2}:\d{2}/);
    const dayPart =
      firstTimeIdx > 0
        ? withoutSeason.slice(0, firstTimeIdx).trim().replace(/[,\s]+$/, "")
        : "";

    let targetDays: string[];
    if (!dayPart) {
      targetDays = [...DAYS];
    } else {
      targetDays = [];
      for (const seg of dayPart.split(",").map((s) => s.trim())) {
        targetDays.push(...expandDayRange(seg));
      }
    }

    if (!targetDays.includes(todayCode)) continue;

    for (const match of timeRanges) {
      const [openH, openM] = match[1].split(":").map(Number);
      const [closeH, closeM] = match[2].split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      let closeMinutes = closeH * 60 + closeM;
      if (closeMinutes <= openMinutes) closeMinutes += 24 * 60;
      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return closeMinutes - currentMinutes <= CLOSING_SOON_THRESHOLD_MIN ? "closing-soon" : "open";
      }
    }
  }

  return "closed";
}
