import type { BeefyAnyBridgeConfig } from '../../config-types.ts';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { BeefyState } from '../../../../../redux-types.ts';
import type { TokenErc20, TokenNative } from '../../../entities/token.ts';
import type BigNumber from 'bignumber.js';
import type { Step } from '../../../reducers/wallet/stepper.ts';
import type { TFunction } from 'react-i18next';

export interface TokenAllowance {
  amount: BigNumber;
  token: TokenErc20;
  spenderAddress: string;
}

export interface IBridgeQuote<T extends BeefyAnyBridgeConfig> {
  readonly id: T['id'];
  config: T;
  input: InputTokenAmount<TokenErc20>;
  output: TokenAmount<TokenErc20>;
  fee: TokenAmount<TokenNative>;
  allowance?: TokenAllowance;
  receiver: string | undefined;
  gas: BigNumber;
  timeEstimate: number;
  withinLimits: boolean;
  limits: {
    from: {
      current: BigNumber;
      max: BigNumber;
    };
    to: {
      current: BigNumber;
      max: BigNumber;
    };
  };
}

export interface IBridgeProvider<T extends BeefyAnyBridgeConfig> {
  readonly id: T['id'];

  fetchQuote(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    receiver: string | undefined,
    state: BeefyState
  ): Promise<IBridgeQuote<T>>;

  fetchBridgeStep(quote: IBridgeQuote<T>, t: TFunction, state: BeefyState): Promise<Step>;
}
