import type BigNumber from 'bignumber.js';
import type { TokenAllowance } from '../apis/allowance/allowance-types.ts';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types.ts';
import type { MinterConfig } from '../apis/config-types.ts';
import { getAllowanceApi, getBalanceApi, getConfigApi, getMintersApi } from '../apis/instances.ts';
import type { FetchMinterReservesResult } from '../apis/minter/minter-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { MinterEntity } from '../entities/minter.ts';
import { isTokenErc20 } from '../entities/token.ts';
import { selectChainById } from '../selectors/chains.ts';
import { selectMinterById } from '../selectors/minters.ts';
import { selectTokenByAddress } from '../selectors/tokens.ts';
import type { BeefyState } from '../store/types.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export interface FulfilledAllMintersPayload {
  byChainId: {
    [chainId in ChainEntity['id']]?: MinterConfig[];
  };
  state: BeefyState;
}

export const fetchAllMinters = createAppAsyncThunk<FulfilledAllMintersPayload, void>(
  'minters/fetchAllMinters',
  async (_, { getState }) => {
    const api = await getConfigApi();
    const minters = await api.fetchAllMinters();
    return { byChainId: minters, state: getState() };
  }
);

interface InitMinterFormParams {
  minterId: MinterEntity['id'];
  walletAddress: string | undefined;
}

interface InitMinterFormPayload {
  minterId: MinterEntity['id'];

  // really, this should be separated
  walletAddress: string | undefined;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  reserves: BigNumber;
  totalSupply: BigNumber;

  // reducers below need to access the state
  state: BeefyState;
}

export const initiateMinterForm = createAppAsyncThunk<InitMinterFormPayload, InitMinterFormParams>(
  'minters/initMinterForm',
  async ({ minterId, walletAddress }, { getState }) => {
    const minter = selectMinterById(getState(), minterId);
    const chain = selectChainById(getState(), minter.chainId);
    const depositToken = selectTokenByAddress(
      getState(),
      minter.chainId,
      minter.depositToken.contractAddress
    );
    const mintedToken = selectTokenByAddress(
      getState(),
      minter.chainId,
      minter.mintedToken.contractAddress
    );
    const spenderAddress = minter.minterAddress;
    const balanceApi = await getBalanceApi(chain);
    const allowanceApi = await getAllowanceApi(chain);
    const mintersApi = await getMintersApi(chain);

    const balanceRes: FetchAllBalancesResult =
      walletAddress ?
        await balanceApi.fetchAllBalances(
          getState(),
          { tokens: [depositToken, mintedToken] },
          walletAddress
        )
      : { tokens: [], govVaults: [], boosts: [], erc4626Pending: [] };

    const allowanceRes =
      walletAddress && spenderAddress && isTokenErc20(depositToken) ?
        await allowanceApi.fetchTokensAllowance(
          getState(),
          [depositToken],
          walletAddress,
          spenderAddress
        )
      : [];

    const reservesRes = await mintersApi.fetchMinterReserves(minter);

    return {
      minterId,
      walletAddress,
      allowance: allowanceRes,
      balance: balanceRes,
      reserves: reservesRes.reserves,
      totalSupply: reservesRes.totalSupply,
      state: getState(),
    };
  }
);

export interface ReloadReservesParams {
  chainId: ChainEntity['id'];
  minterId: MinterEntity['id'];
}

export type ReloadReservesFulfilledPayload = FetchMinterReservesResult;

export const reloadReserves = createAppAsyncThunk<
  ReloadReservesFulfilledPayload,
  ReloadReservesParams
>('minters/reloadReserves', async ({ chainId, minterId }, { getState }) => {
  const state = getState();
  const chain = selectChainById(state, chainId);
  const api = await getMintersApi(chain);
  const minter = selectMinterById(state, minterId);
  return await api.fetchMinterReserves(minter);
});
