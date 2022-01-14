import {
  createAsyncThunk,
  createSlice,
  combineReducers,
  createStore,
  createSelector,
} from '@reduxjs/toolkit';
import axios, { AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
// todo: load these asynchronously
import { pools as bscPools } from '../../../config/vault/bsc';
import { pools as harmonyPools } from '../../../config/vault/harmony';

/**
 * TODO:
 *  - what is "oracle", "oracleId" and "oraclePrice" in current implem? (same for "earnedOracle", "earnedOracleId")
 *  - decide if Risks should be a proper type
 *  - what is earnContractAddress vs earnTokenAddress ?
 *  - Maybe remove the Normalized entity ?
 *  - Why not pull all data from beefy api. The app depends on the beefy api anyway to work properly
 **/

/********************
 * BUSINESS ENTITIES
 ********************/
// The goal of this section is to define some business entities
// that will make the state easier to understand
// This is 100% Work In Progress and is a draft to communicate the
// overall idea

// maybe a RiskAnalysis type would be better
enum VaultRiskTag {
  COMPLEXITY_LOW,
  BATTLE_TESTED,
  IL_NONE,
  MCAP_MEDIUM,
  AUDIT,
  CONTRACTS_VERIFIED,
}
enum VaultTag {
  BEEFY,
  BLUE_CHIP,
  LOW_RISK,
  BOOST,
}

enum VaultType {
  LP,
  SINGLE_ASSET,
  STABLE,
}

type StrategyType = 'StratLP' | 'StratMultiLP' | 'Vamp' | 'Lending' | 'SingleStake' | 'Maxi';

// a nice and easy chain entity
interface Chain {
  id: string;
  name: string;
  rpcEndpoint: string; // maybe not
  urlTemplates: {
    contract: string; // "https://bscscan.com/token/{address}"
    address: string; // "https://bscscan.com/address/{address}"
  };
}

// maybe this is too much
interface SocialUrls {
  twitter: string | null;
  discord: string | null;
  // etc..
}
// I'm not a big fan of this "Platform" wording
// but you get the idea, a platform is "curve", "pancakeswap", "etc"
interface Platform {
  id: string;
  name: string;
  url: string; // "https://ageoftanks.io/"
  socials: SocialUrls;
  chains: Chain['id'][];
}

// this is a big business entity
// maybe it make sense to split this into each token type
// possible. Like "SingleToken", "LP Token", etc
// splitting this will allow the creation of different TS types for each
// token type and it will force user code to act accordingly
interface Token {
  id: string;
  symbol: string;
  chainId: Chain['id'];
  contractAddress: string;
  decimals: number;
  buyUrl: string; // link to 1inch/pancake/...
  project: {
    url: string; // "https://ageoftanks.io/"
    socials: SocialUrls;
  } | null; // some tokens don't have a "project"
}

// WIP, definitely
interface Boost {
  id: string;
  earnedToken: Token['id'];
}

// we put too much data in here for simplicity sake
// but maybe it's smarter to put it in separate entities
// If this can be in a state where half of the data is loaded,
// it is definitely needed to split this, but you get the idea
// we definitly want to have a clear separation between gov vaults and other types of vaults
// this is because they are handled very differently
interface VaultBase {
  id: string;
  name: string;
  logoUri: string;

  // not sure about this one
  // if it's for display only OK
  // if not, we have to be smarter about it
  tags: VaultTag[];

  safetyAnalysis: {
    score: number;
    audited: boolean; // maybe split for multiple audit or
    risks: VaultRiskTag[]; // maybe be smarter about it later?
  };

  strategyType: StrategyType;

  fees: {
    depositFee: number;
    performanceFee: number;
    withdrawalFee: number;
  };
}
interface VaultGov extends VaultBase {
  // TODO
  tokens: {
    earnedToken: Token['id'];
    tokens: Token['id'][];
  };
}
interface VaultLP extends VaultBase {
  // name it pool ?
  tokens: {
    lpToken: Token['id'];
    earnedToken: Token['id'];
    tokens: Token['id'][];
  };
}
// etc
type Vault = VaultLP | VaultGov;

/*******************************
 * EXAMPLE: APIs & API ts types
 *******************************/

// put api code aside, this is business code
// and it should be mockable
// the goal of this api code is just to have
// a nice interface to query data and get good typings
// so we can work with this data properly later on
class VaultAPI {
  public async fetchByChainId(chainId: Chain['id']) {
    if (chainId === 'bsc') {
      return bscPools;
    } else if (chainId === 'harmony') {
      return harmonyPools;
    } else {
      throw Error(`Chain ${chainId} not supported`);
    }
  }
}

// https://jvilk.com/MakeTypes/ can be useful

// maybe "short" and "long" is not the smartest choice of words
interface BeefyAPIBreakdownShort {
  vaultApr: number;
}
interface BeefyAPIBreakdownLong {
  beefyPerformanceFee: number;
  compoundingsPerYear: number;
  lpFee: number;
  totalApy: number;
  tradingApr: number;
  vaultApr: number;
  vaultApy: number;
}

// I'm not sure what those keys are
type BeefyAPIBreakdownResponse = {
  [someKey: string]: BeefyAPIBreakdownShort | BeefyAPIBreakdownLong;
};

// I'm not sure what those keys are
type BeefyAPIHistoricalAPYResponse = {
  // those are of type string but they represent numbers
  // also for some reason there is 7 items on each array
  // idk why though
  [someKey: string]: string[];
};

class BeefyAPI {
  public api: AxiosInstance;
  public data: AxiosInstance;

  constructor() {
    // this could be mocked by passing mock axios to the constructor
    this.api = axios.create({
      baseURL: 'https://api.beefy.finance',
      timeout: 1000,
    });
    this.data = axios.create({
      baseURL: 'https://data.beefy.finance',
      timeout: 1000,
    });
  }

  // here we can nicely type the responses
  public async getPrices(): Promise<{ [tokenId: Token['id']]: number }> {
    return this.api.get('/prices', { params: { _: this.getCacheBuster() } });
  }

  // i'm not 100% certain about the return type
  // are those token ids ?
  public async getLPs(): Promise<{ [tokenId: Token['id']]: number }> {
    return this.api.get('/lps', { params: { _: this.getCacheBuster() } });
  }

  public async getBreakdown(): Promise<BeefyAPIBreakdownResponse> {
    return this.api.get('/apy/breakdown', { params: { _: this.getCacheBuster() } });
  }

  public async getHistoricalAPY(): Promise<BeefyAPIHistoricalAPYResponse> {
    return this.data.get('/bulk', { params: { _: this.getCacheBuster() } });
  }

  // maybe have a local cache instead of this cache busting
  // have to check if this returns browser cache before doing so
  protected getCacheBuster(): number {
    return Math.trunc(Date.now() / (1000 * 60));
  }
}

const vaultAPI = new VaultAPI();
const beefyAPI = new BeefyAPI();

/***********************
 * EXAMPLE: API Actions
 ***********************/

// we use redux toolkit to create actions to avoid a lot of boilerplate code
// nobody likes to write consts and switches anyway
// we also use a trick to reuse the api type, but sometimes the api
// returns way to much data and we can create a stripped down version here
// or at the api level. Simple at the API level, more flexible here
const fetchPrices = createAsyncThunk<Awaited<ReturnType<BeefyAPI['getPrices']>>, {}>(
  'vaults/fetchVaultListForChain',
  async () => {
    const prices = await beefyAPI.getPrices();
    return prices;
  }
);

// given the list of vaults is pulled from some api at some point
// we use the api to create an action
// this action should return just enough data for the state to work with
const fetchVaultList = createAsyncThunk<
  { chainId: Chain['id']; pools: Awaited<ReturnType<VaultAPI['fetchByChainId']>> },
  { chainId: Chain['id'] }
>('vaults/fetchVaultListForChain', async ({ chainId }) => {
  const pools = await vaultAPI.fetchByChainId(chainId);
  return { chainId, pools };
});

/***********************
 * EXAMPLE: REDUX state
 ***********************/

// https://redux.js.org/usage/structuring-reducers/normalizing-state-shape#designing-a-normalized-state
// we could use the npm package normalizr or the redux-toolkit createEntityAdapter
// but I think it's too early/complex for now
type NormalizedEntity<T extends { id: string }> = {
  // Effectively an index of all entities
  byId: {
    [id: string]: T;
  };
  // normalization best practice, keeps the same array reference
  // for iteration, can be extended for vaults with different
  // arrays like "allBscIds", "allHarmonyIds", "allStableIds", etc etc
  allIds: string[];
};

// we have a slice which responsibility is to handle everything related to token data
type TokensState = NormalizedEntity<Token>;
const tokensInitialState: TokensState = {
  allIds: [],
  byId: {},
};
const tokensSlice = createSlice({
  name: 'tokens',
  initialState: tokensInitialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when vault list is fetched, add all new tokens
    builder.addCase(fetchVaultList.fulfilled, (state, action) => {
      for (const vault of action.payload.pools) {
        if (state.byId[vault.earnedToken] === undefined) {
          const token: Token = {
            id: vault.earnedToken,
            symbol: vault.earnedToken,
            chainId: action.payload.chainId,
            contractAddress: vault.earnedTokenAddress,
            decimals: 18, // ????
            // maybe split those because they come later
            buyUrl: vault.buyTokenUrl, // maybe not ?
            project: null,
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[token.id] = token;
          state.allIds.push(token.id);
        }

        if (state.byId[vault.token] === undefined) {
          const token: Token = {
            id: vault.token,
            symbol: vault.token,
            chainId: action.payload.chainId,
            contractAddress: vault.tokenAddress,
            decimals: vault.tokenDecimals,
            buyUrl: vault.buyTokenUrl,
            project: null, // i'm not sure about this though
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[token.id] = token;
          state.allIds.push(token.id);
        }
      }
    });
  },
});

type VaultsState = NormalizedEntity<Vault> & {
  // put retired ids somewhere else
  allActiveIds: Vault['id'][];
  allRetiredIds: Vault['id'][];
};
const vaultsInitialState: VaultsState = {
  allIds: [],
  allActiveIds: [],
  allRetiredIds: [],
  byId: {},
};
const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: vaultsInitialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchVaultList.fulfilled, (state, action) => {
      for (const apiVault of action.payload.pools) {
        if (apiVault.isGovVault) {
          // @ts-ignore
          const vault: VaultGov = {
            id: apiVault.id,
            //...
          };

          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.depositsPaused) {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        } else {
          // @ts-ignore
          const vault: VaultLP = {
            //...
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.depositsPaused) {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        }
      }
    });
  },
});

// here, price state is just a key value
// but we could create a Price object with say "lastUpdate" and other values
interface PricesState {
  byTokenId: {
    [tokenId: Token['id']]: BigNumber;
  };
}
const pricesInitialState: PricesState = {
  byTokenId: {},
};
const pricesSlice = createSlice({
  name: 'prices',
  initialState: pricesInitialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when prices are changed, update prices
    // this could also just be a a super quick drop in replacement
    // if we are OK to not use BigNumber, which I don't think we are
    builder.addCase(fetchPrices.fulfilled, (state, action) => {
      for (const tokenId of Object.keys(action.payload)) {
        const tokenPrice = action.payload[tokenId];
        // new price, add it
        if (state.byTokenId[tokenId] === undefined) {
          state.byTokenId[tokenId] = new BigNumber(tokenPrice);

          // price exists, update it if it changed
        } else if (state.byTokenId[tokenId].comparedTo(tokenPrice) === 0) {
          state.byTokenId[tokenId] = new BigNumber(tokenPrice);
        }
      }
    });
  },
});

// because we want to be smart about data loading
// I think we need a dedicated "loading" slice
// where we can ask which data is loading and which data is loaded
// this will simplify other slices as they can focus on data
// and this slice can focus on data fetching
// maybe it's dumb though, but it can be refactored
interface LoaderStateInit {
  status: 'init';
  error: null;
}
interface LoaderStatePending {
  status: 'pending';
  error: null;
}
interface LoaderStateRejected {
  status: 'rejected';
  error: string;
}
interface LoaderStateFulfilled {
  status: 'fulfilled';
  error: null;
}
type LoaderState =
  | LoaderStateInit
  | LoaderStatePending
  | LoaderStateRejected
  | LoaderStateFulfilled;
// some example of a type guard
function isFulfilled(state: LoaderState): state is LoaderStateFulfilled {
  return state.status === 'fulfilled';
}
function isPending(state: LoaderState): state is LoaderStatePending {
  return state.status === 'pending';
}
const dataLoaderStateInit: LoaderState = { status: 'init', error: null };
const dataLoaderStateFulfilled: LoaderState = { status: 'fulfilled', error: null };
const dataLoaderStatePending: LoaderState = { status: 'pending', error: null };
interface DataLoaderState {
  vaultsLoading: LoaderState;
  pricesLoading: LoaderState;
  tvlLoading: LoaderState;
}
const dataLoaderInitialState: DataLoaderState = {
  vaultsLoading: dataLoaderStateInit,
  pricesLoading: dataLoaderStateInit,
  tvlLoading: dataLoaderStateInit,
};
const dataLoaderSlice = createSlice({
  name: 'dataLoader',
  initialState: dataLoaderInitialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // this could be abstracted away in a function
    // keeping it here so we can understand this code without much headhache
    builder.addCase(fetchPrices.pending, state => {
      state.pricesLoading = dataLoaderStatePending;
    });
    builder.addCase(fetchPrices.rejected, (state, action) => {
      // here, maybe put an error message
      state.pricesLoading = { status: 'rejected', error: action.error + '' };
    });
    builder.addCase(fetchPrices.fulfilled, state => {
      state.pricesLoading = dataLoaderStateFulfilled;
    });

    // handle all 3 cases for each action
    // or just replace these with a smarter loop ^^
    builder.addCase(fetchVaultList.pending, state => {
      state.vaultsLoading = dataLoaderStatePending;
    });
    builder.addCase(fetchVaultList.rejected, (state, action) => {
      // here, maybe put an error message
      state.vaultsLoading = { status: 'rejected', error: action.error + '' };
    });
    builder.addCase(fetchVaultList.fulfilled, state => {
      state.vaultsLoading = dataLoaderStateFulfilled;
    });
  },
});

// TODO: apr slice, TVL slice, etc
// could also create a specific ui slice when that makes sense

/***********************
 * EXAMPLE: Combining slices
 ***********************/

// we can organise reducers in different categories
interface BeefyState {
  entities: {
    prices: PricesState;
    vaults: VaultsState;
    tokens: TokensState;
  };
  ui: {
    // maybe this should be at the root
    // but ts types will make changing this a breeze
    dataLoader: DataLoaderState;
  };
}

const entitiesReducer = combineReducers({
  prices: pricesSlice.reducer,
  vaults: vaultsSlice.reducer,
  tokens: tokensSlice.reducer,
});
const uiReducer = combineReducers({
  dataLoader: dataLoaderSlice.reducer,
});
const mainReducer = combineReducers({
  entities: entitiesReducer,
  ui: uiReducer,
});
// here, the store has all the proper TS typings
const store = createStore(mainReducer);

/***********************
 * EXAMPLE: Selectors
 ***********************/
// the state modules are encouraged to provide selectors
// this will allow to refactor the sate without much impact on the components
// this can allo the state to be normalized and selectors to pull data from
// many places inside the state to simplify component
// it's not mandatory because good TS typings allow us to refactor
// easily but it's a good nice to have
// and this can play well with unit testing

// this is a super weird way to define selectors so I won't be mad if
// this is not the way we do things. With this it's possible to reuse
// and memoize selectors for added performance though
const vaultByIdSelector = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.entities.vaults.byId,
  // get the user passed ID
  (_: BeefyState, vaultId: Vault['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (vaultsByIds, vaultId) => vaultsByIds[vaultId]
);

const isVaultLoadingSelector = createSelector(
  (store: BeefyState) => store.entities.vaults.byId, // could be reused
  (store: BeefyState) => store.ui.dataLoader.pricesLoading,
  (_: BeefyState, vaultId: Vault['id']) => vaultId,
  (vaultsByIds, pricesLoading, vaultId) => {
    // find out if vault is here
    if (vaultsByIds[vaultId]) {
      return true;
    } else {
      // or find out if price query is pending
      return isPending(pricesLoading);
    }
  }
);
const isChainLoadingSelector = createSelector(
  [
    // it's weird but this is how reselect defines params
    (_: BeefyState, chainId: Chain['id']) => chainId,
  ],
  (chainId): boolean => {
    // todo
    return true;
  }
);

const isPricesLoadingSelector = createSelector(
  [(state: BeefyState) => state.ui.dataLoader.pricesLoading],
  (pricesLoading): boolean => {
    return isPending(pricesLoading);
  }
);
// etc, with various level of complexity

/***********************
 * EXAMPLE: Component
 ***********************/

function ExampleComponent() {
  // ideally, only one "useSelector" per component
  // for performance reasons
  const predefinedSelector = useSelector(isPricesLoadingSelector);
  const predefinedSelectorWithParam = useSelector((state: BeefyState) =>
    isChainLoadingSelector(state, 'harmony')
  );
  const customSlowSelector = useSelector((state: BeefyState) => state.entities.tokens.byId['BIFI']);

  return (
    <>
      <pre>{predefinedSelector}</pre>
      <pre>{predefinedSelectorWithParam}</pre>
      <pre>{customSlowSelector}</pre>
    </>
  );
}

/***********************
 * EXAMPLE: Unit testing
 ***********************/
// we want to test as much code as possible
// but we want the test to be robust to change
// Best approach IMHO is to inject mock api clients
// and test the state at each step of the loading, using jest snapshots
// to avoid maintaining large asserts manually

// TODO
