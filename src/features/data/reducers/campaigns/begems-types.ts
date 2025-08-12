import type { Address } from 'viem';
import type BigNumber from 'bignumber.js';

export type SeasonFaq = {
  question: string;
  answer: string;
};

export type SeasonExplainer = {
  title: string;
  paragraphs: string[];
};

export type SeasonConfig = {
  number: number;
  type: 'token' | 'points';
  startTime: number;
  endTime: number;
  explainer: SeasonExplainer;
  faqs: SeasonFaq[];
};

export type SeasonDataToken = {
  type: 'token';
  num: number;
  token: Address | undefined;
  priceForFullShare: BigNumber | undefined;
};

export type UserPoints = {
  address: Address;
  points: number;
  position: number;
};

export type SeasonDataPoints = {
  type: 'points';
  num: number;
  placeholder?: boolean;
  totalPoints: number;
  totalUsers: number;
  top: Array<UserPoints>;
  bottom: Array<UserPoints>;
};

export type SeasonData = SeasonDataToken | SeasonDataPoints;

export type UserPointsData = {
  type: 'points';
  points: number;
  position: number;
};

export type UserSeasonData = UserPointsData;

export type UserSeasonDataByNumber = Record<number, UserSeasonData>;

export type BeGemsState = {
  factory: Address;
  seasons: {
    allNumbers: number[];
    configByNumber: Record<number, SeasonConfig>;
    dataByNumber: Record<number, SeasonData>;
    userDataByAddress: Record<string, UserSeasonDataByNumber>;
  };
};

export type InitCampaignBeGemsPayload = {
  seasons: SeasonData[];
};

export type FetchUserPointsSeasonDataParams = {
  address: string;
  season: number;
};

export type FetchUserPointsSeasonDataPayload = {
  address: string;
  season: number;
  points: number;
  position: number;
};

export type ApiUserDetails = {
  address: Address;
  points: number;
  rank: number;
};

export type ApiSeasonSummary = {
  topUsers: ApiUserDetails[];
  bottomUser: ApiUserDetails;
  totalPoints: number;
  totalUsers: number;
  lastUpdated: number;
};
