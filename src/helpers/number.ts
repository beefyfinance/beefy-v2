export function compoundInterest(
  rate: number,
  principal: number = 1,
  periods: number = 365,
  times: number = 1
): number {
  return compound(rate, principal, periods, times) - principal;
}

export function compound(
  rate: number,
  principal: number = 1,
  periods: number = 365,
  times: number = 1
): number {
  return principal * Math.pow(1 + rate / periods, periods * times);
}

export function percentDifference(a: number, b: number): number {
  return Math.abs((b - a) / a);
}

export class MovingAverage {
  private values: number[] = [];

  constructor(private period: number) {}

  add(value: number) {
    this.values.push(value);
    if (this.values.length > this.period) {
      this.values.shift();
    }

    return this;
  }

  get average(): number {
    return this.values.reduce((a, b) => a + b, 0) / this.values.length;
  }

  next(value: number): number {
    return this.add(value).average;
  }
}

export function isFiniteNumber(x: unknown): x is number {
  return typeof x === 'number' && isFinite(x) && !isNaN(x);
}

export const yearlyToDaily = (apy: number) => {
  const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;

  if (isNaN(g)) {
    return 0;
  }

  return g;
};

export const clamp = (value: number, min: number, max: number): number => {
  if (isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};
