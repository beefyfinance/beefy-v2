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
