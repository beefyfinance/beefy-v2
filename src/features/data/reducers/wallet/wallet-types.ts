import type { ChainEntity } from '../../entities/chain.ts';

/**
 * Only address and hideBalance are persisted
 */
export type WalletState = {
  address: string | undefined;
  connectedAddress: string | undefined;
  selectedChainId: ChainEntity['id'] | null;
  error: 'unsupported chain' | null;
  hideBalance: boolean;
};
