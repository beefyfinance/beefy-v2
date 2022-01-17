import { fetchPricesAction, fetchLPPricesAction } from '../actions/prices';
import { BeefyAPITokenPricesResponse } from '../apis/beefy';
import { tokenPriceSlice, initialTokenPriceState } from './token-price';

describe('Token price slice tests', () => {
  it('should do nothing on pending price list', () => {
    const action = { type: fetchPricesAction.pending };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toEqual(initialTokenPriceState);
  });

  it('should do nothing on rejected price list', () => {
    const action = { type: fetchPricesAction.rejected };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toEqual(initialTokenPriceState);
  });

  it('should update state on fulfilled vault list', () => {
    const payload: BeefyAPITokenPricesResponse = {
      '1AAVE': 238.16568740268866,
      '1AXS': 79.04891966147113,
      '1BTC': 609115.1079533856,
    };
    const action = { type: fetchPricesAction.fulfilled, payload: payload };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toMatchSnapshot();
  });

  it('should do nothing on pending lp price list', () => {
    const action = { type: fetchLPPricesAction.pending };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toEqual(initialTokenPriceState);
  });

  it('should do nothing on rejected lp price list', () => {
    const action = { type: fetchLPPricesAction.rejected };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toEqual(initialTokenPriceState);
  });

  it('should update state on fulfilled vault list', () => {
    const payload: BeefyAPITokenPricesResponse = {
      '1inch-1inch-bnb': 0,
      '2omb-2omb-ftm': 16.710317081168196,
      '2omb-2share-ftm': 171.84420463276956,
    };
    const action = { type: fetchLPPricesAction.fulfilled, payload: payload };
    const state = tokenPriceSlice.reducer(initialTokenPriceState, action);
    expect(state).toMatchSnapshot();
  });
});
