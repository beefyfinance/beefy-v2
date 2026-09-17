import { afterEach, describe, expect, it, vi } from 'vitest';

const CONNECTED = '0x2AC513Bc6432063B391E5b12F04eAba71Aaf30dC';
const OTHER = '0x451391ec8f8B4dEf10E5d8dd0e148A2D2Dd38160';

/**
 * `getSearchParams` reads `window.location.search` once behind `createFactory`, so the search
 * string has to be in place before the module is first imported.
 */
async function overrideWith(search: string) {
  vi.resetModules();
  vi.stubGlobal('window', { location: { search } });
  const { featureFlag_walletAddressOverride } = await import('./feature-flags.ts');
  return featureFlag_walletAddressOverride(CONNECTED);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('featureFlag_walletAddressOverride', () => {
  it('defaults to connected address when __view_as is absent', async () => {
    expect(await overrideWith('')).toBe(CONNECTED);
  });

  it('accepts a valid __view_as override', async () => {
    expect(await overrideWith(`?__view_as=${OTHER}`)).toBe(OTHER);
  });

  it('checksums a valid lowercase __view_as override', async () => {
    expect(await overrideWith(`?__view_as=${OTHER.toLowerCase()}`)).toBe(OTHER);
  });

  it('checksums valid __view_as override with invalid checksum', async () => {
    expect(await overrideWith('?__view_as=0x451391ec8f8B4dEf10E5d8DD0e148A2D2Dd38160')).toBe(OTHER);
  });

  it.each([
    ['not hex', 'notanaddress'],
    ['too short', '0x2ac513bc'],
    ['too long', `${OTHER}00`],
    ['missing 0x', OTHER.slice(2)],
    ['non-hex digits', '0xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'],
    ['an ens name', 'beefy.eth'],
  ])('ignores a malformed override (%s) and keeps the connected address', async (_l, value) => {
    expect(await overrideWith(`?__view_as=${encodeURIComponent(value)}`)).toBe(CONNECTED);
  });
});
