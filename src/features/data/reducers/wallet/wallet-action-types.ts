import type BigNumber from 'bignumber.js';
import type { Hash, TransactionReceipt } from 'viem';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types.ts';
import type { BeefyAnyBridgeConfig } from '../../apis/config-types.ts';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { TokenEntity } from '../../entities/token.ts';
import type { VaultEntity } from '../../entities/vault.ts';

export const WALLET_ACTION = 'WALLET_ACTION';
export const WALLET_ACTION_RESET = 'WALLET_ACTION_RESET';
export type TrxHash = string;
export type TrxError = {
  message: string;
  friendlyMessage?: string;
};
export type BaseAdditionalData = {
  amount: BigNumber;
  token: TokenEntity;
};
export type VaultAdditionalData = BaseAdditionalData;
export type MigrateAdditionalData = BaseAdditionalData & {
  spender: string;
};
export type ZapAdditionalData = BaseAdditionalData & {
  /** Zap type */
  type: 'zap';
  /** Vault zap is on */
  vaultId: VaultEntity['id'];
  /** Expected tokens returned to user */
  expectedTokens: TokenEntity[];
};
export type BridgeAdditionalData = BaseAdditionalData & {
  type: 'bridge';
  quote: IBridgeQuote<BeefyAnyBridgeConfig>;
};
export type BoostAdditionalData = BaseAdditionalData & {
  type: 'boost';
  boostId: BoostPromoEntity['id'];
  walletAddress: string;
};
export type TxAdditionalData =
  | VaultAdditionalData
  | ZapAdditionalData
  | MigrateAdditionalData
  | BridgeAdditionalData
  | BoostAdditionalData;

export function isZapAdditionalData(data: TxAdditionalData | undefined): data is ZapAdditionalData {
  return !!data && 'type' in data && data.type === 'zap';
}

export function isBridgeAdditionalData(
  data: TxAdditionalData | undefined
): data is BridgeAdditionalData {
  return !!data && 'type' in data && data.type === 'bridge';
}

export function isBoostAdditionalData(
  data: TxAdditionalData | undefined
): data is BoostAdditionalData {
  return !!data && 'type' in data && data.type === 'boost';
}

export function isBaseAdditionalData(
  data: TxAdditionalData | undefined
): data is BaseAdditionalData {
  return !!data && 'amount' in data && 'token' in data;
}

export type WalletActionsIdleState = {
  result: undefined;
  data: undefined;
  additional?: undefined;
};
export type WalletActionsErrorState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'error';
  data: {
    error: TrxError;
  };
  additional?: T;
};
export type WalletActionsPendingState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success_pending';
  data: {
    hash: TrxHash;
  };
  additional?: T;
};
export type WalletActionsSuccessState<T extends TxAdditionalData = TxAdditionalData> = {
  result: 'success';
  data: {
    hash: Hash;
    receipt: TransactionReceipt;
  };
  additional?: T;
};
export type WalletActionsState =
  | WalletActionsIdleState
  | WalletActionsErrorState
  | WalletActionsPendingState
  | WalletActionsSuccessState;
