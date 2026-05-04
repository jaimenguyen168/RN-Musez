import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OpeningHoursProps {
  weekdayText: string[];
  showTitle?: boolean;
  iconColor?: string;
}

// ─── OSM opening_hours parser ─────────────────────────────────────────────────
// Handles formats like:
//   "Tu-Fr 09:00-16:00; Sa 10:00-15:00"
//   "We-Mo 11:00-18:00"
//   "Su-Sa 10:00-17:00; Jan 01, Dec 23 off"
//   "09:30-17:00"  (no day prefix = every day)
//   "Apr-Dec: Th-Su 11:00-12:00 \"Guided Tour\""
//   "Mo-Sa 09:00-17:00, Su 12:00-17:00"

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

function expandDayRange(range: string): string[] {
  // e.g. "Tu-Fr" → ["Tu","We","Th","Fr"], "Sa" → ["Sa"]
  const parts = range.split("-");
  if (parts.length === 1) {
    return DAYS.includes(parts[0].trim()) ? [parts[0].trim()] : [];
  }
  const start = DAYS.indexOf(parts[0].trim());
  const end = DAYS.indexOf(parts[1].trim());
  if (start === -1 || end === -1) return [];
  // Handle wrap-around like "Su-Sa" (= all days)
  if (start <= end) return DAYS.slice(start, end + 1);
  return [...DAYS.slice(start), ...DAYS.slice(0, end + 1)];
}

function formatTime(t: string): string {
  // "09:00" → "9:00 AM", "17:00" → "5:00 PM"
  const [hStr, mStr] = t.trim().split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function formatTimeRange(range: string): string {
  // "09:00-17:00" → "9:00 AM – 5:00 PM"
  const match = range.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return range.trim();
  return `${formatTime(match[1])} – ${formatTime(match[2])}`;
}

type DayRow = { day: string; label: string; hours: string };

function parseOsmOpeningHours(raw: string): DayRow[] {
  // Start with all days closed
  const schedule: Record<string, string> = {};
  DAYS.forEach((d) => (schedule[d] = "Closed"));

  // Strip quoted notes like "Guided Tour"
  const cleaned = raw.replace(/"[^"]*"/g, "").replace(/\s+/g, " ").trim();

  // Split on semicolons or commas that separate rule blocks
  // but be careful — commas also appear inside day lists like "Sa,Su"
  // Strategy: split on ";" first, then handle comma-separated day groups
  const rules = cleaned.split(";").map((s) => s.trim()).filter(Boolean);

  for (const rule of rules) {
    // Skip holiday/seasonal exceptions like "Jan 01, Dec 23 off"
    if (/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i.test(rule) &&
        !/\d{2}:\d{2}/.test(rule)) continue;
    if (/off$/i.test(rule) && !/\d{2}:\d{2}/.test(rule)) continue;

    // Strip seasonal prefix like "Apr-Dec:"
    const withoutSeason = rule.replace(/^[A-Z][a-z]+-[A-Z][a-z]+:\s*/i, "");

    // Match pattern: optional day spec, then time range(s)
    // Day spec can be like: "Mo-Fr", "Sa,Su", "Mo", "Su-Sa", or absent (= all days)
    const timeRangeMatch = withoutSeason.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/g);
    if (!timeRangeMatch) continue;

    const formattedTimes = timeRangeMatch.map(formatTimeRange).join(", ");

    // Extract the day portion (everything before the first time)
    const firstTimeIdx = withoutSeason.search(/\d{1,2}:\d{2}/);
    const dayPart = firstTimeIdx > 0
      ? withoutSeason.slice(0, firstTimeIdx).trim().replace(/[,\s]+$/, "")
      : "";

    let targetDays: string[] = [];

    if (!dayPart) {
      // No day spec = applies to all days
      targetDays = [...DAYS];
    } else {
      // Split on commas to handle "Sa,Su" or "Mo-Fr,Su"
      const segments = dayPart.split(",").map((s) => s.trim());
      for (const seg of segments) {
        targetDays.push(...expandDayRange(seg));
      }
    }

    for (const day of targetDays) {
      if (DAYS.includes(day)) {
        schedule[day] = formattedTimes;
      }
    }
  }

  return DAYS.map((d) => ({ day: d, label: DAY_LABELS[d], hours: schedule[d] }));
}

// ─── Component ────────────────────────────────────────────────────────────────

const OpeningHours = ({
  weekdayText,
  showTitle = true,
  iconColor = "#6366F1",
}: OpeningHoursProps) => {
  if (!weekdayText || weekdayText.length === 0) return null;

  const raw = weekdayText[0];

  // Detect whether this is OSM format or already Google's "Day: time" format
  const isGoogleFormat = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/i.test(raw);

  let rows: DayRow[];

  if (isGoogleFormat) {
    // Google format — already one string per day
    rows = weekdayText.map((line) => {
      const colonIdx = line.indexOf(":");
      const label = colonIdx > -1 ? line.slice(0, colonIdx) : line;
      const hours = colonIdx > -1 ? line.slice(colonIdx + 1).trim() : "Closed";
      const dayCode = DAYS.find((d) => DAY_LABELS[d] === label) ?? label.slice(0, 2);
      return { day: dayCode, label, hours };
    });
  } else {
    // OSM format — parse it
    rows = parseOsmOpeningHours(raw);
  }

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  return (
    <View className="p-6">
      {showTitle && (
        <View className="flex-row items-center mb-4">
          <Ionicons name="time" size={20} color={iconColor} />
          <Text className="text-base font-semibold ml-2 text-secondary">
            Opening Hours
          </Text>
        </View>
      )}

      <View className="bg-surface rounded-xl px-4 pb-2 pt-1">
        {rows.map((row, index) => {
          const isToday = row.day === today;
          const isClosed = row.hours === "Closed";
          return (
            <View
              key={index}
              className={`flex-row justify-between items-center py-3 ${
                index < rows.length - 1 ? "border-b border-soft" : ""
              }`}
            >
              <Text
                className={`text-sm ${
                  isToday ? "font-semibold text-main" : "font-normal text-secondary"
                }`}
              >
                {row.label}
              </Text>
              <Text
                className={`text-sm ${
                  isClosed
                    ? "text-red-500"
                    : isToday
                    ? "font-semibold text-main"
                    : "text-secondary"
                }`}
              >
                {row.hours}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default OpeningHours;
