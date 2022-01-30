import { fetchAllBalanceAction } from '../actions/balance';
import { fetchAllPricesAction } from '../actions/prices';
import { dataLoaderSlice, initialDataLoaderState } from './data-loader';

describe('Data Loader slice tests', () => {
  it('should update state on fulfilled global action', () => {
    let sliceState = initialDataLoaderState;

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchAllPricesAction.pending });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchAllPricesAction.fulfilled });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllPricesAction.rejected,
      error: 'fatality',
    });
    expect(sliceState).toMatchSnapshot();
  });

  it('should update state on fulfilled action by chain id', () => {
    let sliceState = initialDataLoaderState;

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.pending,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.fulfilled,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchAllBalanceAction.rejected,
      error: 'fatality',
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();
  });
});
