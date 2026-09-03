import type { SerializedError as SerializedAnyError } from '@reduxjs/toolkit';

export type SerializedQuoteCowcentratedNoSingleSideError = {
  name: 'QuoteCowcentratedNoSingleSideError';
  inputToken: string;
  neededToken: string;
};

export type SerializedQuoteCowcentratedNotCalmError = {
  name: 'QuoteCowcentratedNotCalmError';
  action: 'deposit' | 'withdraw';
};

export type SerializedQuoteCowcentratedNotActionableError = {
  name: 'QuoteCowcentratedNotActionableError';
  message?: string;
  action: 'deposit' | 'withdraw';
  actionableAt: number;
};

export type SerializedQuoteCowcentratedNotCalmAndNotActionableError = {
  name: 'QuoteCowcentratedNotCalmAndNotActionableError';
  message?: string;
  action: 'deposit' | 'withdraw';
};

export type SerializedError =
  | SerializedAnyError
  | SerializedQuoteCowcentratedNoSingleSideError
  | SerializedQuoteCowcentratedNotCalmError
  | SerializedQuoteCowcentratedNotActionableError
  | SerializedQuoteCowcentratedNotCalmAndNotActionableError;
