import { VaultEntity } from '../../entities/vault';
import { BeefyState } from '../../../../redux-types';
import BigNumber from 'bignumber.js';
import { ChainEntity } from '../../entities/chain';
import { TokenEntity } from '../../entities/token';
import { TransactMode } from '../../reducers/wallet/transact';

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

export type VaultQuote = {
  type: 'vault';
  optionId: string;
  amount: BigNumber;
};

export type ZapOption = {
  id: string;
  providerId: string;
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  tokensId: string;
  tokenAddresses: TokenEntity['address'][];
  type: 'zap';
  mode: TransactMode;
};

export type ZapQuote = {
  type: 'zap';
  optionId: string;
  amount: BigNumber;
  steps: ZapQuoteStep[];
};

export type ZapQuoteStepSwap = {
  type: 'swap';
  fromToken: TokenEntity;
  fromAmount: BigNumber;
  toToken: TokenEntity;
  toAmount: BigNumber;
};

export type ZapQuoteStepBuild = {
  type: 'build';
  token0: TokenEntity;
  amount0: BigNumber;
  token1: TokenEntity;
  amount1: BigNumber;
  outputToken: TokenEntity;
  outputAmount: BigNumber;
};

export type ZapQuoteStepDeposit = {
  type: 'deposit';
  token: TokenEntity;
  amount: BigNumber;
};

export type ZapQuoteStep = ZapQuoteStepSwap | ZapQuoteStepBuild | ZapQuoteStepDeposit;

export type TransactOption = VaultOption | ZapOption;

export type TransactQuote = VaultQuote | ZapQuote;

export function isVaultOption(option: TransactOption): option is VaultOption {
  return option.type === 'vault';
}

export function isZapOption(option: TransactOption): option is ZapOption {
  return option.type === 'zap';
}

export interface ITransactApi {
  getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;
  getDepositQuotesFor(
    options: TransactOption[],
    amount: BigNumber
  ): Promise<TransactQuote[] | null>;
}

export interface ITransactProvider {
  readonly id: string;

  getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null>;
  getDepositQuoteFor(option: TransactOption, amount: BigNumber): Promise<TransactQuote | null>;

  getWithdrawOptionsFor(vaultId: VaultEntity['id'], state: BeefyState): Promise<void | null>;
}
