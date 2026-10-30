import type { ApiRevenueStats, ApiTvlByChains } from '../apis/beefy/beefy-data-api-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { MovingAverage } from '../../../helpers/number.ts';

export const WEEK_SECONDS = 7 * 24 * 60 * 60;

/** null when the API has no value, so it shows '-' rather than $0 */
export type RevenueWeek = {
  /** week start, unix seconds (Monday 00:00 UTC) */
  t: number;
  yieldUsd: number | null;
  revenueUsd: number | null;
  buybackUsd: number | null;
  /** BIFI, whole tokens */
  buybackAmount: number | null;
};

type TimePoint = {
  t: number;
  v: number;
};

export const WEEKLY_METRICS = ['yield', 'revenue', 'buyback'] as const;
export type WeeklyMetric = (typeof WEEKLY_METRICS)[number];
export type BuybackUnit = 'usd' | 'bifi';

export type TimePointWithMa = TimePoint & {
  ma: number;
};

const toStat = (value: string | null | undefined) => (value ? Number(value) : null);

/** Weeks that have closed by `now`, oldest first */
export function parseCompleteWeeks(rows: ApiRevenueStats, now: number): RevenueWeek[] {
  return rows
    .filter(row => row.t <= now - WEEK_SECONDS)
    .map(row => ({
      t: row.t,
      yieldUsd: toStat(row.harvests_total_usd),
      revenueUsd: toStat(row.fees_platform_usd),
      buybackUsd: toStat(row.buyback_total_usd),
      buybackAmount: toStat(row.buyback_amount),
    }))
    .sort((a, b) => a.t - b.t);
}

function weekValue(week: RevenueWeek, metric: WeeklyMetric, unit: BuybackUnit): number | null {
  switch (metric) {
    case 'yield':
      return week.yieldUsd;
    case 'revenue':
      return week.revenueUsd;
    case 'buyback':
      return unit === 'bifi' ? week.buybackAmount : week.buybackUsd;
  }
}

/** One metric's weekly points, oldest first, skipping weeks with no value */
export function weekSeries(
  weeks: RevenueWeek[],
  metric: WeeklyMetric,
  unit: BuybackUnit
): TimePoint[] {
  return weeks.flatMap(w => {
    const v = weekValue(w, metric, unit);
    return v === null ? [] : [{ t: w.t, v }];
  });
}

// snapshots with broken prices report 1e25+ for a chain (no chain has held $10B); such days are dropped whole
const MAX_CHAIN_TVL_USD = 1e10;

/** Platform TVL per timestamp; a chain counts while configured and not past its eol, like the chains reducer's activeIds */
export function sumChainTvl(
  data: ApiTvlByChains['data'],
  chainsById: Partial<Record<string, Pick<ChainEntity, 'eol'>>>
): TimePoint[] {
  const totals = new Map<number, number>();
  const broken = new Set<number>();
  for (const [chainId, rows] of Object.entries(data)) {
    const chain = chainsById[chainId];
    if (!chain) continue;
    for (const [t, total] of rows) {
      if (chain.eol && t > chain.eol) continue;
      if (total > MAX_CHAIN_TVL_USD) broken.add(t);
      totals.set(t, (totals.get(t) ?? 0) + total);
    }
  }
  return Array.from(totals, ([t, v]) => ({ t, v }))
    .filter(p => !broken.has(p.t))
    .sort((a, b) => a.t - b.t);
}

/** Moving average over the whole series, then drop the warm-up points before `start` */
export function withMovingAverage(
  points: TimePoint[],
  period: number,
  start: number = 0
): TimePointWithMa[] {
  const ma = new MovingAverage(period);
  return points.map(p => ({ ...p, ma: ma.next(p.v) })).filter(p => p.t >= start);
}

/** Change vs the point `seconds` before the last, found by timestamp; undefined if none falls within one period of it */
export function changeOverPeriod(points: TimePoint[], seconds: number): number | undefined {
  const last = points[points.length - 1];
  if (!last) return undefined;
  const target = last.t - seconds;
  for (let i = points.length - 2; i >= 0; i--) {
    if (points[i].t <= target) {
      return points[i].t > target - seconds && points[i].v ? last.v / points[i].v - 1 : undefined;
    }
  }
  return undefined;
}
