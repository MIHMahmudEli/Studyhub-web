/**
 * ─────────────────────────────────────────────────────────────────
 *  RAMADAN MODE — Pure utility layer
 *  Handles: Ramadan date logic, Suhoor/Iftar windows,
 *  Barakah Streak (localStorage), and Eid transition state.
 * ─────────────────────────────────────────────────────────────────
 *  All dates here are Gregorian. Hijri calculation is approximate;
 *  an admin can override RAMADAN_START via localStorage:
 *      localStorage.setItem('ramadan_override_start', 'YYYY-MM-DD')
 *  Useful for testing the full experience year-round.
 * ─────────────────────────────────────────────────────────────────
 */

const RAMADAN_LENGTH = 30;
const STREAK_KEY = 'barakah_streak';
const STREAK_LAST_KEY = 'barakah_last_visit';
const STREAK_BEST_KEY = 'barakah_best';

/* Default Suhoor & Iftar (Dhaka, BD approx). Admin can override via
   localStorage('ramadan_suhoor' / 'ramadan_iftar') with 'HH:MM' strings. */
const DEFAULT_SUHOOR = '05:00';
const DEFAULT_IFTAR  = '18:15';

/* Known Ramadan start (Gregorian) for nearby years — extend as needed. */
const RAMADAN_TABLE = {
  2024: '2024-03-11',
  2025: '2025-03-01',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-27',
};

/* ─── helpers ─────────────────────────────────────────────────── */

const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
};

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const safeRead = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback;
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
};

const safeWrite = (key, val) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, val); } catch { /* ignore */ }
};

/* ─── Ramadan window detection ────────────────────────────────── */

/**
 * Returns the current Ramadan start date for the relevant year.
 * Falls back to the closest known year if exact lookup fails.
 */
export function getRamadanStart(now = new Date()) {
  const override = safeRead('ramadan_override_start');
  if (override) {
    try { return parseDate(override); } catch { /* ignore */ }
  }
  const year = now.getFullYear();
  const candidate = RAMADAN_TABLE[year];
  if (candidate) return parseDate(candidate);

  // fallback: previous year + ~354 days (lunar year shift)
  const prevYears = Object.keys(RAMADAN_TABLE).map(Number).sort((a, b) => a - b);
  if (prevYears.length) {
    const ref = parseDate(RAMADAN_TABLE[prevYears[prevYears.length - 1]]);
    return new Date(ref.getTime() + (year - prevYears[prevYears.length - 1]) * 354 * 86400 * 1000);
  }
  return now;
}

/**
 * Returns a rich object describing where today sits in the Ramadan calendar.
 *   isRamadan: true if today is within the 30-day window
 *   isEidWindow: 3 days after Ramadan ends — triggers sunrise overlay
 *   currentDay: 1..30 inside Ramadan, else null
 *   daysUntil: days remaining until next Ramadan if not in it
 *   percent: 0..100 progress through Ramadan
 */
export function getRamadanStatus(now = new Date()) {
  const start = getRamadanStart(now);
  const end = new Date(start.getTime() + (RAMADAN_LENGTH - 1) * 86400 * 1000);
  end.setHours(23, 59, 59, 999);

  const eidEnd = new Date(end.getTime() + 3 * 86400 * 1000);

  const t = now.getTime();
  const isRamadan = t >= start.getTime() && t <= end.getTime();
  const isEidWindow = t > end.getTime() && t <= eidEnd.getTime();

  let currentDay = null;
  let percent = 0;
  let daysUntil = null;

  if (isRamadan) {
    const diff = Math.floor((t - start.getTime()) / 86400000);
    currentDay = Math.min(RAMADAN_LENGTH, diff + 1);
    percent = Math.round(((t - start.getTime()) / (end.getTime() - start.getTime())) * 100);
  } else if (t < start.getTime()) {
    daysUntil = Math.ceil((start.getTime() - t) / 86400000);
  }

  return {
    isRamadan,
    isEidWindow,
    isPostRamadan: t > end.getTime(),
    currentDay,
    totalDays: RAMADAN_LENGTH,
    percent,
    daysUntil,
    daysRemaining: isRamadan ? RAMADAN_LENGTH - currentDay : null,
    startDate: start,
    endDate: end,
  };
}

/* ─── Suhoor & Iftar countdown ────────────────────────────────── */

const parseHM = (str, fallback) => {
  if (!str) return fallback;
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return fallback;
  return { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
};

export function getPrayerTimes() {
  const sStr = safeRead('ramadan_suhoor') || DEFAULT_SUHOOR;
  const iStr = safeRead('ramadan_iftar')  || DEFAULT_IFTAR;
  return {
    suhoor: parseHM(sStr, { h: 5, m: 0 }),
    iftar:  parseHM(iStr, { h: 18, m: 15 }),
  };
}

/**
 * Returns the active countdown event right now.
 *   mode: 'iftar'   → currently fasting, count down to iftar
 *   mode: 'suhoor'  → after iftar, count down to next suhoor
 *   target: Date instance
 *   label / sublabel
 */
export function getNextEvent(now = new Date()) {
  const { suhoor, iftar } = getPrayerTimes();

  const today = new Date(now);
  today.setSeconds(0, 0);

  const suhoorToday = new Date(now); suhoorToday.setHours(suhoor.h, suhoor.m, 0, 0);
  const iftarToday  = new Date(now); iftarToday.setHours(iftar.h, iftar.m, 0, 0);

  // Before suhoor → next event is suhoor today (pre-dawn)
  if (now < suhoorToday) {
    return { mode: 'suhoor', target: suhoorToday, label: 'Suhoor begins in', sublabel: 'Pre-dawn meal' };
  }
  // Between suhoor and iftar → fasting, count to iftar
  if (now < iftarToday) {
    return { mode: 'iftar', target: iftarToday, label: 'Iftar in', sublabel: 'Break your fast' };
  }
  // After iftar → next suhoor is tomorrow
  const suhoorTomorrow = new Date(suhoorToday.getTime() + 86400000);
  return { mode: 'suhoor', target: suhoorTomorrow, label: 'Suhoor begins in', sublabel: 'Pre-dawn meal' };
}

/**
 * Format ms-difference as "Hh Mm Ss".
 */
export function formatCountdown(ms) {
  if (ms <= 0) return { h: '00', m: '00', s: '00' };
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

/* ─── Barakah Streak ──────────────────────────────────────────── */

/**
 * Increments / resets the visit streak. Runs once per UTC-day per device.
 * Returns { current, best, isNewDay, isBroken }
 */
export function tickStreak() {
  if (typeof window === 'undefined') return { current: 0, best: 0, isNewDay: false, isBroken: false };

  const today = toYMD(new Date());
  const last  = safeRead(STREAK_LAST_KEY);
  let current = parseInt(safeRead(STREAK_KEY, '0'), 10) || 0;
  let best    = parseInt(safeRead(STREAK_BEST_KEY, '0'), 10) || 0;

  if (last === today) {
    return { current, best, isNewDay: false, isBroken: false };
  }

  const yesterday = toYMD(new Date(Date.now() - 86400000));
  let isBroken = false;

  if (last === yesterday || !last) {
    current = current + 1;
  } else {
    current = 1;
    isBroken = !!last;
  }

  if (current > best) best = current;

  safeWrite(STREAK_KEY,      String(current));
  safeWrite(STREAK_BEST_KEY, String(best));
  safeWrite(STREAK_LAST_KEY, today);

  return { current, best, isNewDay: true, isBroken };
}

export function readStreak() {
  if (typeof window === 'undefined') return { current: 0, best: 0 };
  return {
    current: parseInt(safeRead(STREAK_KEY,      '0'), 10) || 0,
    best:    parseInt(safeRead(STREAK_BEST_KEY, '0'), 10) || 0,
  };
}

