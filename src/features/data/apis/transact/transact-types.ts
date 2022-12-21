import { VaultEntity } from '../../entities/vault';
import { BeefyState } from '../../../../redux-types';
import BigNumber from 'bignumber.js';
import { ChainEntity } from '../../entities/chain';
import { TokenEntity, TokenErc20 } from '../../entities/token';
import { Step } from '../../reducers/wallet/stepper';
import { Namespace, TFunction } from 'react-i18next';
import { TransactMode } from '../../reducers/wallet/transact-types';

export type VaultOption = {
  id: string;
  providerId: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  tokensId: string;
  tokenAddresses: TokenEntity['address'][];
  type: 'vault';
  mode: TransactMode;
};

export type TokenAmount = {
  amount: BigNumber;
  token: TokenEntity;
};

export type InputTokenAmount = {
  amount: BigNumber;
  token: TokenEntity;
  max: boolean;
};

export type QuoteInputTokenAmount = InputTokenAmount;

export type QuoteOutputTokenAmount = TokenAmount;

export type AllowanceTokenAmount = {
  amount: BigNumber;
  token: TokenErc20;
  spenderAddress: string;
};

export type QuoteOutputTokenAmountChange = QuoteOutputTokenAmount & {
  newAmount: QuoteOutputTokenAmount['amount'];
  difference: QuoteOutputTokenAmount['amount'];
};

export type QuoteTokenAmount = QuoteInputTokenAmount | QuoteOutputTokenAmount;

export type VaultQuote = {
  id: string;
  type: 'vault';
  optionId: string;
  allowances: AllowanceTokenAmount[];
  inputs: QuoteInputTokenAmount[];
  outputs: QuoteOutputTokenAmount[];
};

export type GovVaultOption = {
  id: string;
  providerId: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  tokensId: string;
  tokenAddresses: TokenEntity['address'][];
  type: 'gov-vault';
  mode: TransactMode;
};

export type GovVaultQuote = {
  id: string;
  type: 'gov-vault';
  optionId: string;
  allowances: AllowanceTokenAmount[];
  inputs: QuoteInputTokenAmount[];
  outputs: QuoteOutputTokenAmount[];
};

export type ZapFeeSingle = number;
export type ZapFeeDiscounted = { original: number; discounted: number };
export type ZapFee = ZapFeeSingle | ZapFeeDiscounted;

export function isZapFeeDiscounted(zapFee: ZapFee): zapFee is ZapFeeDiscounted {
  return typeof zapFee === 'object';
}

export function isZapFeeSingle(zapFee: ZapFee): zapFee is ZapFeeSingle {
  return typeof zapFee === 'number';
}

export type ZapOption = {
  id: string;
  providerId: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  tokensId: string;
  tokenAddresses: TokenEntity['address'][];
  type: 'zap';
  mode: TransactMode;
  fee: ZapFee;
};

export type ZapQuote = {
  id: string;
  type: 'zap';
  optionId: string;
  allowances: AllowanceTokenAmount[];
  inputs: QuoteInputTokenAmount[];
  outputs: QuoteOutputTokenAmount[];
  steps: ZapQuoteStep[];
  priceImpact: number;
};

export type ZapQuoteStepSwap = {
  type: 'swap';
  fromToken: TokenEntity;
  fromAmount: BigNumber;
  toToken: TokenEntity;
  toAmount: BigNumber;
  priceImpact: number;
};

export type ZapQuoteStepBuild = {
  type: 'build';
  inputs: {
    token: TokenEntity;
    amount: BigNumber;
  }[];
  outputToken: TokenEntity;
  outputAmount: BigNumber;
};

export type ZapQuoteStepDeposit = {
  type: 'deposit';
  token: TokenEntity;
  amount: BigNumber;
};

export type ZapQuoteStepSplit = {
  type: 'split';
  outputs: {
    token: TokenEntity;
    amount: BigNumber;
  }[];
  inputToken: TokenEntity;
  inputAmount: BigNumber;
};

// export type ZapQuoteStepDust = {
//   type: 'dust';
//   token0: TokenEntity;
//   amount0: BigNumber;
//   token1: TokenEntity;
//   amount1: BigNumber;
// };

export type ZapQuoteStep =
  | ZapQuoteStepSwap
  | ZapQuoteStepBuild
  | ZapQuoteStepDeposit
  | ZapQuoteStepSplit;

/*  | ZapQuoteStepDust*/

export function isZapQuoteStepSwap(step: ZapQuoteStep): step is ZapQuoteStepSwap {
  return step.type === 'swap';
}

export type TransactOption = VaultOption | GovVaultOption | ZapOption;

export type TransactQuote = VaultQuote | GovVaultQuote | ZapQuote;

export function isVaultOption(option: TransactOption): option is VaultOption {
  return option.type === 'vault';
}

export function isZapOption(option: TransactOption): option is ZapOption {
  return option.type === 'zap';
}

export function isVaultQuote(quote: TransactQuote): quote is VaultQuote {
  return quote.type === 'vault';
}

export function isGovVaultQuote(quote: TransactQuote): quote is GovVaultQuote {
  return quote.type === 'gov-vault';
}

export function isZapQuote(quote: TransactQuote): quote is ZapQuote {
  return quote.type === 'zap';
}

export interface ITransactApi {
  getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;

  getDepositQuotesFor(
    options: TransactOption[],
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote[] | null>;

  getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step>;

  getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;

  getWithdrawQuotesFor(
    options: TransactOption[],
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote[] | null>;

  getWithdrawStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step>;
}

export interface ITransactProvider {
  getId(): string;

  getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;

  getDepositQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote | null>;

  getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step>;

  getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;

  getWithdrawQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<TransactQuote | null>;

  getWithdrawStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step>;
}
