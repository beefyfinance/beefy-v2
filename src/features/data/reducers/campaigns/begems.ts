import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { initCampaignBeGems } from '../../actions/campaigns/begems.ts';
import { featureFlag_mockSeason } from '../../utils/feature-flags.ts';
import type { BeGemsState } from './begems-types.ts';

const mockOffset = featureFlag_mockSeason() ? 86400 * 70 : 0;

const initialState: BeGemsState = {
  factory: '0x9d9cC601aD926F870220590d22179540566E6722',
  seasons: {
    allNumbers: [1, 2, 3],
    configByNumber: {
      1: {
        number: 1,
        startTime: 1747008000 - mockOffset,
        endTime: 1751327999 - mockOffset,
      },
      2: {
        number: 2,
        startTime: 1751328000 - mockOffset,
        endTime: 1756684799 - mockOffset,
      },
      3: {
        number: 3,
        startTime: 1756684799 - mockOffset,
        endTime: 1761958799 - mockOffset,
      },
    },
    dataByNumber: {
      1: {
        token: '0xd70c020c48403295100884ee47db80d51BAA9d87',
        priceForFullShare: featureFlag_mockSeason() ? new BigNumber('2.345678') : BIG_ZERO,
      },
      2: {
        token: undefined,
        priceForFullShare: BIG_ZERO,
      },
      3: {
        token: undefined,
        priceForFullShare: BIG_ZERO,
      },
    },
  },
};

export const beGemsSlice = createSlice({
  name: 'campaigns/begems',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(initCampaignBeGems.fulfilled, (sliceState, action) => {
      for (const season of action.payload.seasons) {
        const existing = sliceState.seasons.dataByNumber[season.num];
        if (
          !existing ||
          existing.token !== season.token ||
          (existing.priceForFullShare === undefined && season.priceForFullShare !== undefined) ||
          (season.priceForFullShare === undefined && existing.priceForFullShare !== undefined) ||
          !(existing.priceForFullShare || BIG_ZERO).eq(season.priceForFullShare || BIG_ZERO)
        ) {
          sliceState.seasons.dataByNumber[season.num] = {
            token: season.token,
            priceForFullShare:
              (featureFlag_mockSeason() ? existing?.priceForFullShare : season.priceForFullShare) ||
              season.priceForFullShare,
          };
        }
      }
    });
  },
});

export const beGemsReducer = beGemsSlice.reducer;
