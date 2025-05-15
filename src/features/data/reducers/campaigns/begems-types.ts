import type { Address } from 'abitype';

export type SeasonConfig = {
  number: number;
  startTime: number;
  endTime: number;
};

export type SeasonData = {
  token: Address | undefined;
  priceForFullShare: BigNumber | undefined;
};

export type BeGemsState = {
  factory: Address;
  seasons: {
    allNumbers: number[];
    configByNumber: Record<number, SeasonConfig>;
    dataByNumber: Record<number, SeasonData>;
  };
};
