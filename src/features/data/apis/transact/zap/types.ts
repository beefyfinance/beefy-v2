import type { TokenAmount } from '../transact-types.ts';

export type ZapStepRequest = {
  inputs: TokenAmount[];
  outputs: TokenAmount[];
  maxSlippage: number;
  zapRouter: string;
  /** attempt to insert all balance of input tokens to calldata, not supported by all providers */
  insertBalance: boolean;
};

export type ZapStepResponse = {
  inputs: TokenAmount[];
  outputs: TokenAmount[];
  minOutputs: TokenAmount[];
  returned: TokenAmount[];
  zaps: ZapStep[];
};

export type OrderInput = {
  token: string;
  amount: string;
};

export type OrderOutput = {
  token: string;
  minOutputAmount: string;
};

export type OrderRelay = {
  target: string;
  value: string;
  data: string;
};

export type StepToken = {
  token: string;
  index: number;
};

export type ZapStep = {
  target: string;
  value: string;
  data: string;
  tokens: StepToken[];
};

export type ZapOrder = {
  inputs: OrderInput[];
  outputs: OrderOutput[];
  relay: OrderRelay;
  user: string;
  recipient: string;
};

export type UserlessZapOrder = Omit<ZapOrder, 'user' | 'recipient'>;

export type ZapRequest = {
  order: ZapOrder;
  steps: ZapStep[];
};

export type UserlessZapRequest = {
  order: UserlessZapOrder;
  steps: ZapStep[];
};
