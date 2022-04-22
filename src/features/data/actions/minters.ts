import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { MinterConfig } from '../apis/config';
import { getAllowanceApi, getBalanceApi, getConfigApi, getMintersApi } from '../apis/instances';
import { ChainEntity } from '../entities/chain';
import { FetchAllBalancesResult } from '../apis/balance/balance-types';
import { TokenAllowance } from '../apis/allowance/allowance-types';
import { selectMinterById } from '../selectors/minters';
import { selectChainById } from '../selectors/chains';
import { selectTokenById } from '../selectors/tokens';
import { MinterEntity } from '../entities/minter';
import { isTokenErc20 } from '../entities/token';
import BigNumber from 'bignumber.js';
import { FetchMinterReservesReloadResult } from '../apis/minter/minter-types';

export interface FulfilledAllMintersPayload {
  byChainId: {
    [chainId: ChainEntity['id']]: MinterConfig[];
  };
  state: BeefyState;
}

export const fetchAllMinters = createAsyncThunk<
  FulfilledAllMintersPayload,
  void,
  { state: BeefyState }
>('vaults/fetchAllMinters', async (_, { getState }) => {
  const api = getConfigApi();
  const minters = await api.fetchAllMinters();
  return { byChainId: minters, state: getState() };
});

interface InitMinterFormParams {
  minterId: MinterEntity['id'];
  walletAddress: string | null;
}

interface InitMinterFormPayload {
  minterId: MinterEntity['id'];

  // really, this should be separated
  walletAddress: string | null;
  balance: FetchAllBalancesResult;
  allowance: TokenAllowance[];
  reserves: BigNumber;

  // reducers below need to access the state
  state: BeefyState;
}

export const initiateMinterForm = createAsyncThunk<
  InitMinterFormPayload,
  InitMinterFormParams,
  { state: BeefyState }
>('minters/initMinterForm', async ({ minterId, walletAddress }, { getState }) => {
  const minter = selectMinterById(getState(), minterId);
  const chain = selectChainById(getState(), minter.chainId);
  const depositToken = selectTokenById(getState(), minter.chainId, minter.depositToken.oracleId);
  const mintedToken = selectTokenById(getState(), minter.chainId, minter.mintedToken.oracleId);
  const spenderAddress = minter.contractAddress;
  const balanceApi = await getBalanceApi(chain);
  const allowanceApi = await getAllowanceApi(chain);
  const mintersApi = await getMintersApi(chain);

  const balanceRes: FetchAllBalancesResult = walletAddress
    ? await balanceApi.fetchAllBalances(
        getState(),
        [depositToken, mintedToken],
        [],
        [],
        walletAddress
      )
    : { tokens: [], govVaults: [], boosts: [] };

  const allowanceRes =
    walletAddress && spenderAddress && isTokenErc20(depositToken)
      ? await allowanceApi.fetchTokensAllowance([depositToken], walletAddress, spenderAddress)
      : [];

  const reservesRes = await mintersApi.fetchMinterReserves(minter);

  return {
    minterId,
    walletAddress,
    allowance: allowanceRes,
    balance: balanceRes,
    reserves: reservesRes,
    state: getState(),
  };
});

export interface ReloadReservesParams {
  chainId: ChainEntity['id'];
  minterId: MinterEntity['id'];
}

export interface ReloadReservesFulfilledPayload {
  reserves: FetchMinterReservesReloadResult;
  state: BeefyState;
}

export const reloadReserves = createAsyncThunk<
  ReloadReservesFulfilledPayload,
  ReloadReservesParams,
  { state: BeefyState }
>('minters/reloadReserves', async ({ chainId, minterId }, { getState }) => {
  const chain = selectChainById(getState(), chainId);

  const api = await getMintersApi(chain);
  const minter = selectMinterById(getState(), minterId);

  const reserves = await api.fetchMinterReserves(minter);

  return {
    reserves: { id: minterId, reserves },
    state: getState(),
  };
});
