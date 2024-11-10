import { AnyVaultWithData } from './vault/data-types';

type SummaryCounts = {
  active: number;
  eol: number;
  paused: number;
  total: number;
};

export type ChainValidateResult = {
  success: boolean;
  summary: {
    [K in AnyVaultWithData['type']]: SummaryCounts;
  } & { all: SummaryCounts };
};
