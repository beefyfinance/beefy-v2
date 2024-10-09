export enum GyroPoolJoinKind {
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT = 3,
}

export enum GyroPoolExitKind {
  EXACT_BPT_IN_FOR_TOKENS_OUT = 1,
}

export type RatesResult = {
  rate0: string;
  rate1: string;
};
