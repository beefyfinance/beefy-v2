const initialState = {
  prices: {},
  apy: {},
  historicalApy: {},
  lastUpdated: 0,
};

export const pricesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PRICES':
      return {
        ...state,
        prices: action.payload.prices,
        apy: action.payload.apy,
        historicalApy: action.payload.historicalApy,
        lastUpdated: action.payload.lastUpdated,
      };
    default:
      return state;
  }
};