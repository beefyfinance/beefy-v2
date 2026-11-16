/** fee fractions, e.g. 0.003 = 0.3% */
export type ClmFeeRange = {
  min: number;
  max: number;
};

export type ClmFee = {
  id: string;
  /** undefined if the read failed */
  swapFee: number | undefined;
  /** only set by the range fetch, undefined when the pool's fee has no known bounds */
  range?: ClmFeeRange | undefined;
};
