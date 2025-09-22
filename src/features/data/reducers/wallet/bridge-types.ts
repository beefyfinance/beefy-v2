import type { SerializedError } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import type { IBridgeQuote } from '../../apis/bridge/providers/provider-types.ts';
import type {
  BeefyAnyBridgeConfig,
  BeefyBridgeConfig,
  BeefyBridgeIdToConfig,
} from '../../apis/config-types.ts';
import type { InputTokenAmount } from '../../apis/transact/transact-types.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import type { TokenErc20 } from '../../entities/token.ts';

export enum FormStep {
  Loading = 1,
  Preview,
  Confirm,
  Transaction,
  SelectFromNetwork,
  SelectToNetwork,
}

export type BridgeFormState = {
  step: FormStep;
  from: ChainEntity['id'];
  to: ChainEntity['id'];
  input: InputTokenAmount<TokenErc20>;
  receiverIsDifferent: boolean;
  receiverAddress: string | undefined;
};
export type BridgeValidateState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  requestId?: string;
};
export type BridgeQuoteState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  selected: BeefyAnyBridgeConfig['id'] | undefined;
  quotes: {
    allIds: IBridgeQuote<BeefyAnyBridgeConfig>['id'][];
    byId: Partial<
      Record<IBridgeQuote<BeefyAnyBridgeConfig>['id'], IBridgeQuote<BeefyAnyBridgeConfig>>
    >;
  };
  limitedQuotes: {
    allIds: IBridgeQuote<BeefyAnyBridgeConfig>['id'][];
    byId: Partial<
      Record<IBridgeQuote<BeefyAnyBridgeConfig>['id'], IBridgeQuote<BeefyAnyBridgeConfig>>
    >;
  };
  error: SerializedError | undefined;
  limitError?: {
    current: BigNumber;
    max: BigNumber;
    canWait: boolean;
  };
  requestId: string | undefined;
};
export type BridgeConfirmState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  requestId?: string;
  error?: SerializedError;
  quote?: IBridgeQuote<BeefyAnyBridgeConfig>;
  outgoing?: {
    hash: string;
    mined: boolean;
  };
  incoming?: {
    hash: string;
    mined: boolean;
  };
};
export type BridgesMap = {
  [K in BeefyAnyBridgeConfig['id']]?: BeefyBridgeIdToConfig<K>;
};
export type BridgeState = {
  source: BeefyBridgeConfig['source'] | undefined;
  tokens: Partial<Record<ChainEntity['id'], string>>;
  destinations: {
    allChains: ChainEntity['id'][];
    chainToAddress: Partial<Record<ChainEntity['id'], string>>;
    chainToChain: Partial<Record<ChainEntity['id'], ChainEntity['id'][]>>;
    chainToBridges: Partial<
      Record<ChainEntity['id'], Record<ChainEntity['id'], BeefyAnyBridgeConfig['id'][]>>
    >;
  };
  bridges: BridgesMap | undefined;
  form: BridgeFormState | undefined;
  validate: BridgeValidateState;
  quote: BridgeQuoteState;
  confirm: BridgeConfirmState;
};
