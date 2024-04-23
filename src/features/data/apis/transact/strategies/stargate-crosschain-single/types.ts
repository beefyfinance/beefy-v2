import type { TokenEntity } from '../../../../entities/token';
import type { ChainEntity } from '../../../../entities/chain';
import type { ZapEntity } from '../../../../entities/zap';

export type StargateConfig = {
  /** Stargate internal chain id */
  chainId: number;
  /** StargateComposer address */
  composerAddress: string;
  /** BeefyStargateZapReceiver address */
  zapReceiverAddress?: string;
  /** Gas limit for zap deposit tx (deposit into vault) */
  depositGasLimit: string;
  /** Gas limit for zap withdraw tx (sending token only) */
  withdrawGasLimit: string;
};

export type StargateConfigToken = {
  chainId: ChainEntity['id'];
  symbol: string;
  poolAddress: string;
  tokenAddress: string;
  convertRate: string;
  poolId: string;
  feeLibraryAddress: string;
};

export type StargateConfigPath = { source: StargateConfigToken; dest: StargateConfigToken };

export type StargatePath = {
  canDeposit: boolean;
  canWithdraw: boolean;
  source: StargateConfigPath['source'] & {
    token: TokenEntity;
    zap: ZapEntity;
  };
  dest: StargateConfigPath['dest'] & {
    token: TokenEntity;
    zap: ZapEntity;
  };
};

export type LibraryGetFeesResult = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
};

export const LibraryGetFeesResultKey = {
  amount: 0,
  eqFee: 1,
  eqReward: 2,
  lpFee: 3,
  protocolFee: 4,
  lkbRemoveFee: 5,
} as const satisfies Record<string, keyof LibraryGetFeesResult>;

export enum StargateZapType {
  Deposit = 0,
  Withdraw = 1,
}
