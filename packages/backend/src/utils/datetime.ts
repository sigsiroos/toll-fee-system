const TIME_ZONE = "Europe/Stockholm";

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const HOLIDAYS_BY_YEAR: Record<number, string[]> = {
  2024: [
    "01-01",
    "03-29",
    "04-01",
    "05-01",
    "06-06",
    "06-21",
    "12-24",
    "12-25",
    "12-26",
    "12-31",
  ],
  2025: [
    "01-01",
    "04-18",
    "04-21",
    "05-01",
    "06-06",
    "06-20",
    "12-24",
    "12-25",
    "12-26",
    "12-31",
  ],
};

export function getLocalDateKey(date: Date): string {
  return dateFormatter.format(date);
}

export function isWeekend(date: Date): boolean {
  const zoned = toTimeZone(date);
  const day = zoned.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(date: Date): boolean {
  const zoned = toTimeZone(date);
  const year = zoned.getFullYear();
  const month = `${zoned.getMonth() + 1}`.padStart(2, "0");
  const day = `${zoned.getDate()}`.padStart(2, "0");
  const key = `${month}-${day}`;
  const holidays = HOLIDAYS_BY_YEAR[year];
  if (!holidays) {
    return false;
  }

  return holidays.includes(key);
}

export function getMinutesSinceMidnight(date: Date): number {
  const zoned = toTimeZone(date);
  return zoned.getHours() * 60 + zoned.getMinutes();
}

function toTimeZone(date: Date): Date {
  const locale = date.toLocaleString("en-US", { timeZone: TIME_ZONE });
  return new Date(locale);
}
