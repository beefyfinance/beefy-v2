import { fetchAllBalanceAction } from '../actions/balance';
import { fetchAllPricesAction } from '../actions/prices';
import { dataLoaderSlice, initialDataLoaderState } from './data-loader';

describe('Data Loader slice tests', () => {
  it('should update state on fulfilled global action', () => {
    let sliceState = initialDataLoaderState;

    expect(sliceState.global.prices.alreadyLoadedOnce).toBe(false);

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchAllPricesAction.pending });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.global.prices.alreadyLoadedOnce).toBe(false);

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchAllPricesAction.fulfilled });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.global.prices.alreadyLoadedOnce).toBe(true);

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllPricesAction.rejected,
      error: 'fatality',
    });
    expect(sliceState).toMatchSnapshot();
    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllPricesAction.rejected,
      error: { message: 'fatality message' },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllPricesAction.rejected,
      error: { name: 'fatality name' },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllPricesAction.rejected,
      error: { code: 1234 },
    });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.global.prices.alreadyLoadedOnce).toBe(true);

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchAllPricesAction.pending });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.global.prices.alreadyLoadedOnce).toBe(true);
  });

  it('should update state on fulfilled action by chain id', () => {
    let sliceState = initialDataLoaderState;

    expect(sliceState.byChainId['test']).toBe(undefined);
    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.pending,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.byChainId['test'].balance.alreadyLoadedOnce).toBe(false);

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.fulfilled,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.byChainId['test'].balance.alreadyLoadedOnce).toBe(true);

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.rejected,
      error: 'fatality',
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.byChainId['test'].balance.alreadyLoadedOnce).toBe(true);

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.pending,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    expect(sliceState.byChainId['test'].balance.alreadyLoadedOnce).toBe(true);
  });
});
