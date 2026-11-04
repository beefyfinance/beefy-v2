import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { erc20Token } from '../apis/transact/helpers/same-balance.test-helper.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { BeefyState } from '../store/types.ts';
import { addTokenToWalletAction } from './add-to-wallet.ts';
import aaplUrl from '../../../images/single-assets/AAPL.png?url';
import usdt0Url from '../../../images/single-assets/USDT0.svg?url';

const ORIGIN = 'https://app.beefy.test';

const polygonUsdt0 = erc20Token(
  'polygon',
  'USDT',
  'USDT0',
  '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  6
);
const robinhoodAapl = erc20Token(
  'robinhood',
  'AAPLrh',
  'AAPL',
  '0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1',
  18
);
const unknownImage = erc20Token(
  'base',
  'NOIMAGE',
  'NOIMAGE',
  '0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0',
  18
);

function stateWith(token: TokenEntity): BeefyState {
  return {
    entities: {
      tokens: {
        byChainId: {
          [token.chainId]: { byAddress: { [token.address.toLowerCase()]: token } },
        },
      },
    },
  } as unknown as BeefyState;
}

async function iconUrlFor(token: TokenEntity, customIconUrl?: string) {
  const thunk = addTokenToWalletAction({
    chainId: token.chainId,
    tokenAddress: token.address,
    customIconUrl,
  });
  const action = await thunk(vi.fn(), () => stateWith(token), undefined);
  if (!addTokenToWalletAction.fulfilled.match(action)) {
    throw new Error(`addTokenToWalletAction did not fulfill: ${action.error.message}`);
  }
  return action.payload.iconUrl;
}

describe('addTokenToWalletAction icon', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { location: { origin: ORIGIN } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the image for the token symbol, not one named after its id', async () => {
    expect(await iconUrlFor(polygonUsdt0)).toBe(`${ORIGIN}${usdt0Url}`);
  });

  it('finds an image for a token whose id has no image', async () => {
    expect(await iconUrlFor(robinhoodAapl)).toBe(`${ORIGIN}${aaplUrl}`);
  });

  it('prefers the custom icon url', async () => {
    expect(await iconUrlFor(polygonUsdt0, 'https://example.test/icon.png')).toBe(
      'https://example.test/icon.png'
    );
  });

  it('is empty when no image matches', async () => {
    expect(await iconUrlFor(unknownImage)).toBe('');
  });
});
