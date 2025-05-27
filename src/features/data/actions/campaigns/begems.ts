import type { Address } from 'abitype';
import BigNumber from 'bignumber.js';
import { beGemsFactoryAbi } from '../../../../config/abi/BeGemsFactoryAbi.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { isFulfilledResult } from '../../../../helpers/promises.ts';
import { fetchContract } from '../../apis/rpc-contract/viem-contract.ts';
import type { TokenEntity } from '../../entities/token.ts';
import { addToken } from '../../reducers/tokens.ts';
import { selectWalletAddress } from '../../selectors/wallet.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { bigNumberOrStaticZero } from '../../utils/selector-utils.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../tokens.ts';

type SeasonData = {
  num: number;
  token: Address | undefined;
  priceForFullShare: BigNumber | undefined;
};

export type InitCampaignBeGemsPayload = {
  seasons: SeasonData[];
};

export const initCampaignBeGems = createAppAsyncThunk<InitCampaignBeGemsPayload>(
  'campaigns/begems/init',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const allNumbers = state.ui.campaigns.begems.seasons.allNumbers;
    const factoryAddress = state.ui.campaigns.begems.factory;
    const factory = fetchContract(factoryAddress, beGemsFactoryAbi, 'sonic');
    const [dataPerSeason, ppfsPerSeason] = await Promise.all([
      Promise.allSettled(
        allNumbers.map(seasonNumber => factory.read.getSeason([BigInt(seasonNumber)]))
      ),
      Promise.allSettled(
        allNumbers.map(seasonNumber => factory.read.getPriceForFullShare([BigInt(seasonNumber)]))
      ),
    ]);
    const seasons = dataPerSeason.map((data, index) => {
      const seasonNumber = allNumbers[index];
      const ppfs = ppfsPerSeason[index];

      return {
        num: seasonNumber,
        token: (isFulfilledResult(data) && data.value.gems) || undefined,
        priceForFullShare: bigNumberOrStaticZero(
          isFulfilledResult(ppfs) && ppfs ? new BigNumber(ppfs.value) : BIG_ZERO
        ),
      } satisfies SeasonData;
    });

    const tokens = seasons
      .map(({ token, num }) => {
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
