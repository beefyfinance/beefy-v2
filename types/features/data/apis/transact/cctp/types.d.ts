import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../entities/chain';
import type { TokenErc20 } from '../../../entities/token';
import type { OrderOutput, OrderRelay, ZapStep } from '../zap/types';
export type ZapPayload = {
    recipient: string;
    outputs: OrderOutput[];
    relay: OrderRelay;
    route: ZapStep[];
};
export type CCTPBridgeQuote = {
    fromChainId: ChainEntity['id'];
    toChainId: ChainEntity['id'];
    fromToken: TokenErc20;
    toToken: TokenErc20;
    fromAmount: BigNumber;
    toAmount: BigNumber;
    fee: BigNumber;
    timeEstimate: number;
};
