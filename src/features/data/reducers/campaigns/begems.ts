import { createSlice } from '@reduxjs/toolkit';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { fetchUserPointsSeasonData, initCampaignBeGems } from '../../actions/campaigns/begems.ts';
import type { BeGemsState } from './begems-types.ts';

const initialState: BeGemsState = {
  factory: '0x9d9cC601aD926F870220590d22179540566E6722',
  seasons: {
    allNumbers: [1, 2, 3],
    configByNumber: {
      1: {
        number: 1,
        type: 'token',
        startTime: 1747008000,
        endTime: 1750248000, // Wed Jun 18 2025 12:00:00 UTC
        explainer: {
          title: 'Redeem your beGEMS for S tokens',
          paragraphs: [
            'Sonic Gems are airdrop points awarded exclusively by Sonic to apps building on its chain. They’re distributed based on various factors and are redeemable for S tokens at the end of each season.',
            'Beefy is issuing 80,000,000 beGEMS each season, representing its share of earned S tokens. beGEMS are liquid ERC-20 tokens — transferable, tradeable, and open to speculation. Users can earn beGEMS by boosting vaults, providing liquidity in lending markets, or voting for beS pairs across Sonic exchanges.',
          ],
        },
        faqs: [
          {
            question: 'How can I earn beGEMS?',
            answer:
              'You can earn beGEMS by boosting specific vaults, providing liquidity to Sonic lending markets, and voting on key beS trading pairs on Sonic exchanges.',
          },
          {
            question: 'How much is a beGEMS worth?',
            answer:
              "beGEMS are redeemable for a proportional share of Beefy's Sonic Gems allocation at the end of each season. Their value depends on how many Sonic Gems Beefy earns during that season.",
          },
          {
            question: 'When can I redeem beGEMS?',
            answer:
              'At the end of each season, the redeem module above will become active, allowing beGEMS holders to claim S tokens.',
          },
          {
            question: 'When does the season end?',
            answer:
              'Season 1 ends in June. Start and end dates for future seasons haven’t been announced yet.',
          },
        ],
      },
      2: {
        number: 2,
        type: 'points',
        startTime: 1750248000,
        endTime: 1758196800, // Thu Sep 18 2025 12:00:00 UTC,
        explainer: {
          title: 'Track your beGEMS points and climb the leaderboard',
          paragraphs: [
            'Sonic Gems are airdrop points awarded exclusively by Sonic to apps building on its chain. They’re distributed based on various factors and are redeemable for S tokens at the end of each season.',
            'In Season 2, beGEMS are distributed as off-chain points to Beefy users of whitelisted vaults and pools on Sonic, starting from June 18, 2025, until the season ends. Each point reflects $1 in user deposits held over a 24-hour period.',
          ],
        },
        faqs: [
          {
            question: 'How can I earn beGEMS points?',
            answer:
              'Deposit into any eligible vault or pool on the Sonic chain, and you’ll start accruing beGEMS points the following day. Your points will be visible on this page.',
          },
          {
            question: 'How much are beGEMS points worth?',
            answer:
              "beGEMS points are redeemable for a proportional share of Beefy's Sonic Gems allocation at the end of each season. Their value depends on how many Sonic Gems Beefy earns during that season.",
          },
          {
            question: 'When can I redeem beGEMS points?',
            answer:
              'Shortly after the end of Season 2, Sonic will distribute S tokens either directly to Beefy users or to Beefy, which will then pass them on to the respective users.',
          },
          {
            question: 'When does Season 2 end?',
            answer:
              'The end of Season 2 hasn’t been announced yet. It will be decided by Sonic. Follow Sonic and Beefy socials for updates.',
          },
        ],
      },
      3: {
        number: 3,
        type: 'points',
        startTime: 1758196800, // Thu Sep 18 2025 12:00:00 UTC,
        endTime: 1766059200, // Thu Dec 18 2025 12:00:00 UTC
        explainer: {
          title: 'Season 3 is coming soon',
          paragraphs: ['Check back later for details on Season 3 of Beefy Gems.'],
        },
        faqs: [],
      },
    },
    dataByNumber: {
      1: {
        num: 1,
        type: 'token',
        token: '0xd70c020c48403295100884ee47db80d51BAA9d87',
        priceForFullShare: BIG_ZERO,
      },
    },
    userDataByAddress: {},
  },
};

export const beGemsSlice = createSlice({
  name: 'campaigns/begems',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(initCampaignBeGems.fulfilled, (sliceState, action) => {
        for (const season of action.payload.seasons) {
          const existing = sliceState.seasons.dataByNumber[season.num];
          switch (season.type) {
            case 'token': {
              if (
                !existing ||
                existing.type !== season.type ||
                existing.token !== season.token ||
                (existing.priceForFullShare === undefined &&
                  season.priceForFullShare !== undefined) ||
                (season.priceForFullShare === undefined &&
                  existing.priceForFullShare !== undefined) ||
                !(existing.priceForFullShare || BIG_ZERO).eq(season.priceForFullShare || BIG_ZERO)
              ) {
                sliceState.seasons.dataByNumber[season.num] = {
                  ...season,
                };
              }
              break;
            }
            case 'points': {
              sliceState.seasons.dataByNumber[season.num] = {
                ...season,
              };
              // pre-fill user data for those in top/bottom lists
              for (const entry of [...season.top, ...season.bottom]) {
                const byAddress = (sliceState.seasons.userDataByAddress[
                  entry.address.toLowerCase()
                ] ??= {});
                byAddress[season.num] = {
                  type: 'points',
                  points: entry.points,
                  position: entry.position,
                };
              }
              break;
            }
          }
        }
      })
      .addCase(fetchUserPointsSeasonData.fulfilled, (sliceState, action) => {
        const { address, season, points, position } = action.payload;
        const byAddress = (sliceState.seasons.userDataByAddress[address.toLowerCase()] ??= {});
        byAddress[season] = {
          type: 'points',
          points,
          position,
        };
      });
  },
});

export const beGemsReducer = beGemsSlice.reducer;
