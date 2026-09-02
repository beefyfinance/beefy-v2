/**
 * Tokenized stocks keep trading on-chain while the equity market behind them is shut, so their
 * price can drift away from the last close. This models that gap: US equities close 16:00
 * America/New_York on Friday and Asia reopens 09:00 Tokyo on Monday (00:00 UTC, JST has no DST).
 *
 * Market holidays are not modelled - only the weekend.
 */

/**
 * TEST MODE - set back to false to restore the real Friday-to-Monday window.
 *
 * While true the market counts as shut at all times and the reference price is simply 24h ago, so
 * the banner and the deposit/withdraw checkbox are live on any weekday and can be exercised without
 * waiting for a weekend. Note the banner still reads "at market close" - the copy is not adjusted,
 * so what you see is otherwise exactly what ships.
 */
const COMPARE_TO_DAY_AGO = true;

const CLOSE_TIME_ZONE = 'America/New_York';
const CLOSE_HOUR = 16;
const FRIDAY = 5;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type StockMarketWeekend = {
  /** instant the equity market closed */
  closedAt: Date;
  /** instant Asian markets reopen */
  reopensAt: Date;
};

export type StockMarketState = {
  /** set only while the market is shut for the weekend */
  weekend: StockMarketWeekend | undefined;
  /** when `weekend` next appears or disappears */
  nextChangeAt: Date;
};

/**
 * Offset of `timeZone` at `date`, in ms. Adding it to the instant yields a Date whose getUTC*
 * accessors read as the wall clock in that zone.
 */
function getTimeZoneOffset(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const partAsNumber = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value);
  const asUtc = Date.UTC(
    partAsNumber('year'),
    partAsNumber('month') - 1,
    partAsNumber('day'),
    // some engines format midnight as hour 24
    partAsNumber('hour') % 24,
    partAsNumber('minute'),
    partAsNumber('second')
  );
  // the formatter drops sub-second precision, so compare against a whole second
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant at which it is `hour:00:00` on the given calendar day in `timeZone`. */
function zonedHourToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  timeZone: string
): Date {
  const wallClock = Date.UTC(year, month, day, hour);
  // the offset we need is the one in force at the answer, not at the wall clock read as UTC,
  // so guess once then re-resolve - enough for any zone whose DST shift is under a day
  const guess = new Date(wallClock - getTimeZoneOffset(new Date(wallClock), timeZone));
  return new Date(wallClock - getTimeZoneOffset(guess, timeZone));
}

/** `now` as a Date whose getUTC* accessors read as New York wall clock. */
function toMarketWallClock(now: Date): Date {
  return new Date(now.getTime() + getTimeZoneOffset(now, CLOSE_TIME_ZONE));
}

function fridayCloseInstant(wallClock: Date, dayOffset: number): Date {
  return zonedHourToInstant(
    wallClock.getUTCFullYear(),
    wallClock.getUTCMonth(),
    wallClock.getUTCDate() + dayOffset,
    CLOSE_HOUR,
    CLOSE_TIME_ZONE
  );
}

/** Most recent Friday close at or before `now`. */
function getLastFridayClose(now: Date): Date {
  const wallClock = toMarketWallClock(now);
  const daysSinceFriday = (wallClock.getUTCDay() - FRIDAY + 7) % 7;
  const closedAt = fridayCloseInstant(wallClock, -daysSinceFriday);
  // on a Friday before the bell the "most recent" close is the week before
  return closedAt <= now ? closedAt : fridayCloseInstant(wallClock, -daysSinceFriday - 7);
}

/** First Friday close strictly after `now`. */
function getNextFridayClose(now: Date): Date {
  const wallClock = toMarketWallClock(now);
  const daysUntilFriday = (FRIDAY - wallClock.getUTCDay() + 7) % 7;
  const closedAt = fridayCloseInstant(wallClock, daysUntilFriday);
  return closedAt > now ? closedAt : fridayCloseInstant(wallClock, daysUntilFriday + 7);
}

/** Rounds down to the hour, matching the hourly price grid. */
function floorToHour(ms: number): Date {
  return new Date(Math.floor(ms / HOUR_MS) * HOUR_MS);
}

/**
 * TEST MODE window: always shut, comparing against the price 24h back.
 *
 * The reference instant is floored to the hour so it holds still between renders - it keys the
 * price selector's cache, and a value that moved every render would refetch and re-render forever.
 */
export function getDayAgoState(now: Date): StockMarketState {
  const nextHour = new Date(floorToHour(now.getTime()).getTime() + HOUR_MS);
  return {
    weekend: { closedAt: floorToHour(now.getTime() - DAY_MS), reopensAt: nextHour },
    nextChangeAt: nextHour,
  };
}

export function getStockMarketState(now: Date): StockMarketState {
  return COMPARE_TO_DAY_AGO ? getDayAgoState(now) : getWeekendState(now);
}

/** The real window: shut from the Friday bell until Asian markets reopen. */
export function getWeekendState(now: Date): StockMarketState {
  const closedAt = getLastFridayClose(now);
  // Monday 00:00 UTC; closedAt is 20:00/21:00 UTC so it is still Friday in UTC terms
  const reopensAt = new Date(
    Date.UTC(closedAt.getUTCFullYear(), closedAt.getUTCMonth(), closedAt.getUTCDate() + 3)
  );

  if (now >= reopensAt) {
    return { weekend: undefined, nextChangeAt: getNextFridayClose(now) };
  }

  return { weekend: { closedAt, reopensAt }, nextChangeAt: reopensAt };
}
