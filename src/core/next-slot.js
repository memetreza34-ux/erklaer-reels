import { readdir } from 'node:fs/promises';
import path from 'node:path';

const WEEKDAYS = [
  { name: 'montag', offset: 0 },
  { name: 'dienstag', offset: 1 },
  { name: 'mittwoch', offset: 2 },
  { name: 'donnerstag', offset: 3 },
  { name: 'freitag', offset: 4 },
  { name: 'samstag', offset: 5 },
  { name: 'sonntag', offset: 6 }
];

function pad(value) {
  return String(value).padStart(2, '0');
}

function normalizeDate(date) {
  const value = date instanceof Date ? new Date(date) : new Date(date);
  if (Number.isNaN(value.getTime())) throw new Error('Ungültiges Startdatum.');
  value.setHours(12, 0, 0, 0);
  return value;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function isoWeekMonday(year, week) {
  const januaryFourth = new Date(year, 0, 4, 12, 0, 0, 0);
  const day = januaryFourth.getDay() || 7;
  const firstMonday = addDays(januaryFourth, 1 - day);
  return addDays(firstMonday, (week - 1) * 7);
}

function getIsoWeek(date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

function getWeekMonday(date) {
  const result = normalizeDate(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  return result;
}

function formatShortDate(date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}`;
}

function formatIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function weekDirectoryName(monday) {
  const { year, week } = getIsoWeek(monday);
  const sunday = addDays(monday, 6);
  return `${year}-KW${pad(week)}_${formatShortDate(monday)}_bis_${formatShortDate(sunday)}`;
}

function parseWeekDirectory(name) {
  const match = String(name).match(/^(\d{4})-KW(\d{2})_/);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(week) || week < 1 || week > 53) return null;
  return {
    name,
    year,
    week,
    monday: isoWeekMonday(year, week)
  };
}

async function listDirectories(directory) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory());
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function dayContainsReel(dayDirectory) {
  const entries = await listDirectories(dayDirectory);
  return entries.some((entry) => /^reel-\d+_/.test(entry.name));
}

async function firstFreeDay(outputRoot, week) {
  for (const weekday of WEEKDAYS) {
    const date = addDays(week.monday, weekday.offset);
    const dayDirectory = path.join(outputRoot, week.name, weekday.name);
    if (!(await dayContainsReel(dayDirectory))) {
      return {
        date,
        weekday: weekday.name,
        weekDirectoryName: week.name,
        dayDirectory
      };
    }
  }
  return null;
}

export async function findNextFreeProductionSlot({
  outputRoot = 'reels',
  now = new Date()
} = {}) {
  const anchor = normalizeDate(now);
  const entries = await listDirectories(outputRoot);
  const weeks = entries
    .map((entry) => parseWeekDirectory(entry.name))
    .filter(Boolean)
    .sort((a, b) => a.monday - b.monday);

  if (weeks.length > 0) {
    const latestWeek = weeks.at(-1);
    const freeInLatestWeek = await firstFreeDay(outputRoot, latestWeek);
    if (freeInLatestWeek) {
      return {
        ...freeInLatestWeek,
        dateValue: formatIsoDate(freeInLatestWeek.date),
        reason: 'first-free-day-in-latest-week'
      };
    }

    const nextMonday = addDays(latestWeek.monday, 7);
    const nextWeek = {
      name: weekDirectoryName(nextMonday),
      monday: nextMonday
    };
    const freeInNextWeek = await firstFreeDay(outputRoot, nextWeek);
    return {
      ...freeInNextWeek,
      dateValue: formatIsoDate(freeInNextWeek.date),
      reason: 'latest-week-full-next-monday'
    };
  }

  const monday = getWeekMonday(anchor);
  const anchorOffset = Math.max(0, (anchor.getDay() || 7) - 1);
  const initialWeek = {
    name: weekDirectoryName(monday),
    monday
  };

  for (const weekday of WEEKDAYS.slice(anchorOffset)) {
    const date = addDays(monday, weekday.offset);
    const dayDirectory = path.join(outputRoot, initialWeek.name, weekday.name);
    if (!(await dayContainsReel(dayDirectory))) {
      return {
        date,
        dateValue: formatIsoDate(date),
        weekday: weekday.name,
        weekDirectoryName: initialWeek.name,
        dayDirectory,
        reason: 'no-existing-week-start-at-current-day'
      };
    }
  }

  const nextMonday = addDays(monday, 7);
  return {
    date: nextMonday,
    dateValue: formatIsoDate(nextMonday),
    weekday: 'montag',
    weekDirectoryName: weekDirectoryName(nextMonday),
    dayDirectory: path.join(outputRoot, weekDirectoryName(nextMonday), 'montag'),
    reason: 'current-week-has-no-future-free-day'
  };
}
