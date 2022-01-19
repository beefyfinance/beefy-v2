import { initialAllowanceState } from '../reducers/allowance';
import { initialApyState } from '../reducers/apy';
import { initialBalanceState } from '../reducers/balance';
import { initialBoostsState } from '../reducers/boosts';
import { initialChainsState } from '../reducers/chains';
import { initialDataLoaderState } from '../reducers/data-loader';
import { initialHistoricalApyState } from '../reducers/historical-apy';
import { initialTokenPriceState } from '../reducers/token-price';
import { initialTokensState } from '../reducers/tokens';
import { initialTvlState } from '../reducers/tvl';
import { initialVaultsState } from '../reducers/vaults';
import { BeefyState } from '../state';

/**
 * Create a new BeefyState with some data included
 * This is used in tests to get a decent starting state
 * when doing things like TVL or APY computation
 */
export function getBeefyInitialState(): BeefyState {
  return {
    entities: {
      allowance: initialAllowanceState,
      apy: initialApyState,
      balance: initialBalanceState,
      boosts: initialBoostsState,
      chains: initialChainsState,
      historicalApy: initialHistoricalApyState,
      prices: initialTokenPriceState,
      tokens: initialTokensState,
      tvl: initialTvlState,
      vaults: initialVaultsState,
    },
    ui: {
      dataLoader: initialDataLoaderState,
    },
  };
}
