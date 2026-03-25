import type { TokenAmount } from '../transact-types.ts';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import {
  type SerializedError,
  type SerializedQuoteCowcentratedNoSingleSideError,
  type SerializedQuoteCowcentratedNotCalmError,
} from './error-types.ts';
import { miniSerializeError } from '@reduxjs/toolkit';

export class QuoteChangedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuoteChangedError';
  }
}

abstract class SerializableError extends Error {
  serialize(): SerializedError {
    return miniSerializeError(this);
  }
}

export class QuoteCowcentratedNoSingleSideError extends SerializableError {
  public static readonly name = 'QuoteCowcentratedNoSingleSideError';
  public readonly name = QuoteCowcentratedNoSingleSideError.name;
  public readonly inputToken: string;
  public readonly neededToken: string;

  constructor(inputs: TokenAmount[]) {
    super("This position can't accept single-sided deposits right now.");

    if (inputs[0].amount.gt(BIG_ZERO)) {
      this.inputToken = inputs[0].token.symbol;
      this.neededToken = inputs[1].token.symbol;
    } else {
      this.inputToken = inputs[1].token.symbol;
      this.neededToken = inputs[0].token.symbol;
    }
  }

  serialize(): SerializedQuoteCowcentratedNoSingleSideError {
    return {
      ...miniSerializeError(this),
      name: this.name,
      inputToken: this.inputToken,
      neededToken: this.neededToken,
    };
  }

  static match(error: SerializedError): error is SerializedQuoteCowcentratedNoSingleSideError {
    return error.name === QuoteCowcentratedNoSingleSideError.name;
  }
}

export class QuoteCowcentratedNotCalmError extends SerializableError {
  public static readonly name = 'QuoteCowcentratedNotCalmError';
  public readonly name = QuoteCowcentratedNotCalmError.name;

  constructor(public readonly action: 'deposit' | 'withdraw') {
    super(
      `${
        action === 'withdraw' ? 'Withdraws' : 'New deposits'
      } are temporarily unavailable as the current price is outside the calm zone. Please wait a few minutes and try again.`
    );
  }

  serialize(): SerializedQuoteCowcentratedNotCalmError {
    return {
      ...miniSerializeError(this),
      name: this.name,
      action: this.action,
    };
  }

  static match(error: SerializedError): error is SerializedQuoteCowcentratedNotCalmError {
    return error.name === QuoteCowcentratedNotCalmError.name;
  }
}

export function isSerializableError(error: unknown): error is SerializableError {
  return !!error && error instanceof SerializableError;
}

export function serializeError(error: unknown): SerializedError {
  if (isSerializableError(error)) {
    return error.serialize();
  }

  return miniSerializeError(error);
}
