import { isError } from '../../../../helpers/error.ts';

export class WalletConnectionUserAbortedError extends Error {
  static readonly NAME = 'WalletConnectionUserAbortedError';

  constructor() {
    super('Wallet connection was aborted by the user');
    this.name = WalletConnectionUserAbortedError.NAME;
  }
}

export function isWalletConnectionUserAbortedError(error: unknown): boolean {
  return isError(error) && error.name === WalletConnectionUserAbortedError.NAME;
}

export class WalletDuplicateRequestAbortedError extends Error {
  static readonly NAME = 'WalletDuplicateRequestAbortedError';

  constructor() {
    super('Previous wallet connection has been aborted due to a new request');
    this.name = WalletDuplicateRequestAbortedError.NAME;
  }
}

export function isWalletDuplicateRequestAbortedError(error: unknown): boolean {
  return isError(error) && error.name === WalletDuplicateRequestAbortedError.NAME;
}
