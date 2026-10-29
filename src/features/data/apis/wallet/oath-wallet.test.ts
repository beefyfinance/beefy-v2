import { EventEmitter } from 'events';
import type { GetInterfaceHelpers, WalletHelpers, WalletModule } from '@web3-onboard/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOathWalletModule, oathWallet } from './oath-wallet.ts';

const mocks = vi.hoisted(() => ({
  init: vi.fn(),
  subscribeKey: vi.fn(),
  reset: vi.fn(),
}));
vi.mock('@walletconnect/ethereum-provider', () => ({ EthereumProvider: { init: mocks.init } }));
vi.mock('@reown/appkit-controllers', () => ({
  ModalController: { subscribeKey: mocks.subscribeKey },
  RouterController: { reset: mocks.reset },
}));

const desktop: WalletHelpers = { device: { os: null, browser: null, type: null } };
const helpers = {
  chains: [
    { id: '0x1', token: 'ETH', label: 'Ethereum', rpcUrl: 'https://example.com/eth' },
    { id: '0xa4b1', token: 'ETH', label: 'Arbitrum', rpcUrl: 'https://example.com/arb' },
  ],
  appMetadata: { name: 'Beefy', description: 'Test app', icon: 'https://example.com/icon.svg' },
  EventEmitter,
} as unknown as GetInterfaceHelpers;

function moduleForTest() {
  return createOathWalletModule('public-test-id')(desktop) as WalletModule;
}

function makeConnector() {
  return Object.assign(new EventEmitter(), {
    session: undefined as object | undefined,
    connect: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    request: vi.fn().mockResolvedValue(['0x1111111111111111111111111111111111111111']),
  });
}

describe('Oath Wallet module', () => {
  let connector: ReturnType<typeof makeConnector>;
  let unsubscribe: ReturnType<typeof vi.fn>;
  let modalOpen: (open: boolean) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    connector = makeConnector();
    mocks.init.mockResolvedValue(connector);
    unsubscribe = vi.fn();
    mocks.subscribeKey.mockImplementation((_key, callback) => {
      modalOpen = callback;
      return unsubscribe;
    });
  });

  it('uses the native module contract with the local rounded logo', async () => {
    const module = moduleForTest();
    expect(module.label).toBe('Oath Wallet');
    const icon = decodeURIComponent(await module.getIcon());
    expect(icon).toContain('data:image/svg+xml,');
    expect(icon).toContain("rx='256'");
    expect(oathWallet.mobile_link).toBe('oathwallet://');
    expect(oathWallet.app_store).toBe('https://apps.apple.com/app/id6780187283');
  });

  it('does not offer an iOS-only app on Android', () => {
    const device = {
      type: 'mobile',
      os: { name: 'Android', version: '16' },
      browser: { name: 'Chrome', version: '140' },
    } as const;
    expect(createOathWalletModule('public-test-id')({ device })).toBeNull();
  });

  it('keeps the Oath entry available on iOS', () => {
    const device = {
      type: 'mobile',
      os: { name: 'iOS', version: '26' },
      browser: { name: 'Safari', version: '26' },
    } as const;
    expect(createOathWalletModule('public-test-id')({ device })).not.toBeNull();
  });

  it('isolates its session and preserves Beefy chains, RPC URLs and identity', async () => {
    await moduleForTest().getInterface(helpers);
    expect(mocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'public-test-id',
        customStoragePrefix: 'beefy-oath-wallet',
        chains: [],
        optionalChains: [1, 42161],
        showQrModal: true,
        rpcMap: { 1: 'https://example.com/eth', 42161: 'https://example.com/arb' },
        metadata: {
          name: 'Beefy',
          description: 'Test app',
          url: 'https://app.beefy.com',
          icons: ['https://example.com/icon.svg'],
        },
      })
    );
  });

  it('preserves the required-chain override', async () => {
    const module = createOathWalletModule('public-test-id', 42161)(desktop) as WalletModule;
    await module.getInterface(helpers);
    expect(mocks.init.mock.calls[0][0].chains).toEqual([42161]);
  });

  it('selects the named QR view only during its connection attempt', async () => {
    const { provider } = await moduleForTest().getInterface(helpers);
    connector.connect.mockImplementation(async () => {
      modalOpen(false);
      expect(mocks.reset).not.toHaveBeenCalled();
      modalOpen(true);
    });
    await expect(provider.request({ method: 'eth_requestAccounts' })).resolves.toEqual([
      '0x1111111111111111111111111111111111111111',
    ]);
    expect(mocks.reset).toHaveBeenCalledExactlyOnceWith('ConnectingWalletConnect', {
      wallet: oathWallet,
    });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('preserves cancellation and removes routing listeners before a retry', async () => {
    const { provider } = await moduleForTest().getInterface(helpers);
    const rejection = new Error('Connection request reset');
    connector.connect.mockRejectedValueOnce(rejection);
    await expect(provider.request({ method: 'eth_requestAccounts' })).rejects.toBe(rejection);
    expect(unsubscribe).toHaveBeenCalledOnce();
    await provider.request({ method: 'eth_requestAccounts' });
    expect(connector.connect).toHaveBeenCalledTimes(2);
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it('reuses an approved session without opening a new pairing modal', async () => {
    const { provider } = await moduleForTest().getInterface(helpers);
    connector.session = {};
    await provider.request({ method: 'eth_requestAccounts' });
    expect(connector.connect).not.toHaveBeenCalled();
    expect(mocks.subscribeKey).not.toHaveBeenCalled();
  });

  it('reports modal cancellation in the form required by Onboard retry controls', async () => {
    const { provider } = await moduleForTest().getInterface(helpers);
    connector.connect.mockRejectedValueOnce(
      new Error('Connection request reset. Please try again.')
    );
    await expect(provider.request({ method: 'eth_requestAccounts' })).rejects.toMatchObject({
      code: 4001,
    });
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('delegates RPC methods, network events and disconnection to the native provider', async () => {
    const request = connector.request;
    const { provider } = await moduleForTest().getInterface(helpers);
    const listener = vi.fn();
    provider.on('chainChanged', listener);
    connector.emit('chainChanged', '0xa4b1');
    expect(listener).toHaveBeenCalledWith('0xa4b1');
    provider.removeListener('chainChanged', listener);
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xa4b1' }],
    });
    expect(request).toHaveBeenCalledWith({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xa4b1' }],
    });
    expect(provider).toBe(connector);
    await connector.disconnect();
    expect(connector.disconnect).toHaveBeenCalledOnce();
  });

  it('propagates initialization failure without registering modal listeners', async () => {
    const error = new Error('Provider unavailable');
    mocks.init.mockRejectedValueOnce(error);
    await expect(moduleForTest().getInterface(helpers)).rejects.toBe(error);
    expect(mocks.subscribeKey).not.toHaveBeenCalled();
  });

  it('rejects an empty chain configuration before initializing a provider', async () => {
    await expect(moduleForTest().getInterface({ ...helpers, chains: [] })).rejects.toThrow(
      'at least one configured chain'
    );
    expect(mocks.init).not.toHaveBeenCalled();
  });
});
