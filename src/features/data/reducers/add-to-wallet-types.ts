import type { SerializedError } from '@reduxjs/toolkit';
import type { TokenEntity } from '../entities/token.ts';

export type AddToWalletState = {
  status: 'idle' | 'pending' | 'fulfilled' | 'rejected';
  requestId: string | null;
  token: TokenEntity | null;
  iconUrl: string | null;
  error: SerializedError | null;
};
