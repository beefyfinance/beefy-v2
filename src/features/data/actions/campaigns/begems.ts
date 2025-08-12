import BigNumber from 'bignumber.js';
import { beGemsFactoryAbi } from '../../../../config/abi/BeGemsFactoryAbi.ts';
import { BIG_ZERO, fromWei } from '../../../../helpers/big-number.ts';
import { isFulfilledResult } from '../../../../helpers/promises.ts';
import { fetchContract } from '../../apis/rpc-contract/viem-contract.ts';
import type { TokenEntity } from '../../entities/token.ts';
import { addToken } from '../../reducers/tokens.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { bigNumberOrStaticZero } from '../../utils/selector-utils.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../tokens.ts';
import type {
  ApiSeasonSummary,
  ApiUserDetails,
  BeGemsState,
  FetchUserPointsSeasonDataParams,
  FetchUserPointsSeasonDataPayload,
  InitCampaignBeGemsPayload,
  SeasonConfig,
  SeasonDataPoints,
  SeasonDataToken,
} from '../../reducers/campaigns/begems-types.ts';
import { selectBeGemsSeason } from '../../selectors/campaigns/begems.ts';
import { getJson } from '../../../../helpers/http/http.ts';
import { getAddress } from 'viem';

async function fetchTokenSeason(
  state: BeGemsState,
  config: SeasonConfig
): Promise<SeasonDataToken> {
  const factoryAddress = state.factory;
  const factory = fetchContract(factoryAddress, beGemsFactoryAbi, 'sonic');
  const [data, ppfs] = await Promise.allSettled([
    factory.read.getSeason([BigInt(config.number)]),
    factory.read.getPriceForFullShare([BigInt(config.number)]),
  ]);

  return {
    type: 'token',
    num: config.number,
    token: (isFulfilledResult(data) && data.value.gems) || undefined,
    priceForFullShare: bigNumberOrStaticZero(
      isFulfilledResult(ppfs) && ppfs.value ?
        fromWei(new BigNumber(ppfs.value.toString()), 18)
      : BIG_ZERO
    ),
  } satisfies SeasonDataToken;
}

async function fetchPointsSeason(
  _state: BeGemsState,
  config: SeasonConfig
): Promise<SeasonDataPoints> {
  if (config.number === 2) {
    const summary = await getJson<ApiSeasonSummary>({
      url: 'https://lrt.beefy.finance/api/v2/beefy/begems/summary',
    });

    return {
      type: 'points',
      num: config.number,
      placeholder: false,
      totalPoints: summary.totalPoints,
      totalUsers: summary.totalUsers,
      top: summary.topUsers.map(u => ({ address: u.address, points: u.points, position: u.rank })),
      bottom: [
        {
          address: summary.bottomUser.address,
          points: summary.bottomUser.points,
          position: summary.bottomUser.rank,
        },
      ],
    };
  }

  return {
    type: 'points',
    num: config.number,
    placeholder: true,
    totalPoints: 123_456_789,
    totalUsers: 23_456,
    top: [
      { address: '0x1234567890123456789012345678901234567890', points: 123_456, position: 1 },
      { address: '0x0987654321098765432109876543210987654321', points: 98_765, position: 2 },
      { address: '0x1122334455667788990011223344556677889900', points: 87_654, position: 3 },
      { address: '0x2233445566778899001122334455667788990011', points: 76_543, position: 4 },
      { address: '0x3344556677889900112233445566778899001122', points: 65_432, position: 5 },
      { address: '0x4455667788990011223344556677889900112233', points: 54_321, position: 6 },
      { address: '0x5566778899001122334455667788990011223344', points: 43_210, position: 7 },
      { address: '0x6677889900112233445566778899001122334455', points: 32_109, position: 8 },
      { address: '0x7788990011223344556677889900112233445566', points: 21_098, position: 9 },
      { address: '0x8899001122334455667788990011223344556677', points: 10_987, position: 10 },
    ],
    bottom: [
      { address: '0xaabbccddeeff0011223344556677889900112233', points: 1, position: 23_456 },
    ],
  };
}

export const initCampaignBeGems = createAppAsyncThunk<InitCampaignBeGemsPayload>(
  'campaigns/begems/init',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const allNumbers = state.ui.campaigns.begems.seasons.allNumbers;
    const factoryAddress = state.ui.campaigns.begems.factory;
    const seasons = await Promise.all(
      allNumbers.map(seasonNumber => {
        const config = state.ui.campaigns.begems.seasons.configByNumber[seasonNumber];
        if (!config) {
          throw new Error(`No config found for season ${seasonNumber}`);
        }

        switch (config.type) {
          case 'token': {
            return fetchTokenSeason(state.ui.campaigns.begems, config);
          }
          case 'points': {
            return fetchPointsSeason(state.ui.campaigns.begems, config);
          }
          default: {
            throw new Error(`Unknown season type: ${config.type}`);
          }
        }
      })
    );

    const tokens = seasons
      .map(data => {
        if (data?.type !== 'token') {
          return undefined;
        }
        const { num, token } = data;
        if (!token) {
          return undefined;
        }

        return {
          id: `beGEMS${num}`,
          symbol: `beGEMS${num}`,
          oracleId: `beGEMS${num}`,
          type: 'erc20',
          chainId: 'sonic',
          address: token,
          decimals: 18,
          buyUrl: '',
          website: 'https://app.beefy.com/campaigns/begems',
          description: `Season ${num} of Beefy Gems`,
          documentation: '',
          risks: [],
        } satisfies TokenEntity;
      })
      .filter(isDefined);

    if (tokens.length) {
      for (const token of tokens) {
        dispatch(addToken({ token, interesting: true }));
      }

      const walletAddress = selectWalletAddress(state);
      if (walletAddress) {
        dispatch(
          reloadBalanceAndAllowanceAndGovRewardsAndBoostData({
            chainId: 'sonic',
            tokens,
            walletAddress,
            spenderAddress: factoryAddress,
          })
        );
      }
    }

    return {
      seasons,
    };
  }
);

export const fetchUserPointsSeasonData = createAppAsyncThunk<
  FetchUserPointsSeasonDataPayload,
  FetchUserPointsSeasonDataParams
>('campaigns/begems/fetchUserPointsSeasonData', async ({ address, season }, { getState }) => {
  const state = getState();
  const config = selectBeGemsSeason(state, season);
  if (config.type !== 'points') {
    throw new Error(`Season ${season} is not a points season`);
  }

  if (config.number === 2) {
    try {
      const data = await getJson<ApiUserDetails>({
        url: `https://lrt.beefy.finance/api/v2/beefy/begems/user/${getAddress(address)}`,
      });
      return {
        address,
        season,
        points: data.points,
        position: data.rank,
      };
    } catch (e) {
      console.error(`Failed to fetch user points for address ${address} in season ${season}:`, e);
    }
  }

  return {
    address,
    season,
    points: 0,
    position: 0,
  };
});
