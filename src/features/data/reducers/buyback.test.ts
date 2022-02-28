import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../redux-types';
import { fetchBeefyBuybackAction } from '../actions/prices';
import { BeefyAPIBuybackResponse } from '../apis/beefy';
import { selectTotalBuybackTokenAmount, selectTotalBuybackUsdAmount } from '../selectors/buyback';
import { buybackSlice, initialBuybackState } from './buyback';

describe('Buyback slice tests', () => {
  it('should update state on fulfilled buyback action', async () => {
    const payload: BeefyAPIBuybackResponse = {
      bsc: { buybackTokenAmount: new BigNumber('0'), buybackUsdAmount: new BigNumber('0') },
      polygon: {
        buybackTokenAmount: new BigNumber('0.535709913009709997'),
        buybackUsdAmount: new BigNumber('1197.3521608619992880891961859928494'),
      },
      cronos: {
        buybackTokenAmount: new BigNumber('0.503019530037920513'),
        buybackUsdAmount: new BigNumber('1124.2866831844021983137114413887526'),
      },
    };

    const action = { type: fetchBeefyBuybackAction.fulfilled, payload: payload };
    const newState = buybackSlice.reducer(initialBuybackState, action);
    expect(newState).toMatchSnapshot();

    // expect that we can compute total buyback
    const state: BeefyState = { biz: { buyback: newState } } as BeefyState;
    expect({
      totalBuybackUsdAmount: selectTotalBuybackUsdAmount(state),
      totalBuybackTokenAmount: selectTotalBuybackTokenAmount(state),
    }).toMatchSnapshot();
  });
});
