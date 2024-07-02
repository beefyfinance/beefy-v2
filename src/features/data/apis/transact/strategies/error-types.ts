import type { SerializedError as SerializedAnyError } from '@reduxjs/toolkit';

export type SerializedQuoteCowcentratedNoSingleSideError = {
  name: 'QuoteCowcentratedNoSingleSideError';
  inputToken: string;
  neededToken: string;
};

export type SerializedQuoteCowcentratedNotCalmError = {
  name: 'QuoteCowcentratedNotCalmError';
};

export type SerializedError =
  | SerializedAnyError
  | SerializedQuoteCowcentratedNoSingleSideError
  | SerializedQuoteCowcentratedNotCalmError;

export abstract class SerializableError extends Error {
  abstract serialize(): SerializedError;
}
