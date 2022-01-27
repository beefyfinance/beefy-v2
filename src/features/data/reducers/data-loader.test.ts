import { fetchBoostBalanceAction } from '../actions/balance';
import { fetchPricesAction } from '../actions/prices';
import { dataLoaderSlice, initialDataLoaderState } from './data-loader';

describe('Data Loader slice tests', () => {
  it('should update state on fulfilled global action', () => {
    let sliceState = initialDataLoaderState;

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchPricesAction.pending });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, { type: fetchPricesAction.fulfilled });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchPricesAction.rejected,
      error: 'fatality',
    });
    expect(sliceState).toMatchSnapshot();
  });

  it('should update state on fulfilled action by chain id', () => {
    let sliceState = initialDataLoaderState;

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchBoostBalanceAction.pending,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchBoostBalanceAction.fulfilled,
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();

    sliceState = dataLoaderSlice.reducer(sliceState, {
      type: fetchBoostBalanceAction.rejected,
      error: 'fatality',
      meta: { arg: { chainId: 'test' } },
    });
    expect(sliceState).toMatchSnapshot();
  });
});
