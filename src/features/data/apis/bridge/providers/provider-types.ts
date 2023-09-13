import type { BeefyAnyBridgeConfig } from '../../config-types';
import type { InputTokenAmount, TokenAmount } from '../../transact/transact-types';
import type { ChainEntity } from '../../../entities/chain';
import type { BeefyState } from '../../../../../redux-types';
import type { TokenErc20 } from '../../../entities/token';
import type BigNumber from 'bignumber.js';
import type { Step } from '../../../reducers/wallet/stepper';
import type { TFunction } from 'react-i18next';

export interface TokenAllowance {
  amount: BigNumber;
  token: TokenErc20;
  spenderAddress: string;
}

export interface IBridgeQuote<T extends BeefyAnyBridgeConfig> {
  readonly id: T['id'];
  config: T;
  input: InputTokenAmount;
  output: TokenAmount;
  fee: TokenAmount;
  allowance?: TokenAllowance;
  gas: BigNumber;
  timeEstimate: number;
}

export interface IBridgeProvider<T extends BeefyAnyBridgeConfig> {
  readonly id: T['id'];

  fetchQuote(
    config: T,
    from: ChainEntity,
    to: ChainEntity,
    input: InputTokenAmount<TokenErc20>,
    state: BeefyState
  ): Promise<IBridgeQuote<T>>;

  fetchBridgeStep(quote: IBridgeQuote<T>, t: TFunction, state: BeefyState): Promise<Step>;
}
