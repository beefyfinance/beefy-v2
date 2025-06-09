import { createSlice } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { initCampaignBeGems } from '../../actions/campaigns/begems.ts';
import type { BeGemsState } from './begems-types.ts';

const initialState: BeGemsState = {
  factory: '0x9d9cC601aD926F870220590d22179540566E6722',
  seasons: {
    allNumbers: [1, 2, 3],
    configByNumber: {
      1: {
        number: 1,
        startTime: 1747008000,
        endTime: 1750248000, // Wed Jun 18 2025 12:00:00 UTC
      },
      2: {
        number: 2,
        startTime: 1750248000,
        endTime: 1755518400, // Mon Aug 18 2025 12:00:00 UTC
      },
      3: {
        number: 3,
        startTime: 1755518400,
        endTime: 1760788800, // Sat Oct 18 2025 12:00:00 UTC
      },
    },
    dataByNumber: {
      1: {
        token: '0xd70c020c48403295100884ee47db80d51BAA9d87',
        priceForFullShare: BIG_ZERO,
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
            priceForFullShare: season.priceForFullShare,
          };
        }
      }
    });
  },
});

export const beGemsReducer = beGemsSlice.reducer;
