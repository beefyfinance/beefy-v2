import type { CreateConnectorFn } from '@wagmi/core';
import type { LazyValue } from './helpers.ts';

export type WalletInitOptions = {
  app: {
    name: string;
    description: string;
    url: string;
    icon: string;
  };
};

export type WalletInit = (options: WalletInitOptions) => Promise<Wallet>;

export type BaseWalletOptions = {
  priority?: number;
};

/**
 * qr - show our qr code ui
 * embed - show an embedded ui e.g. modal
 * external - nothing shown in-page e.g. injected wallet
 **/
export type WalletUIType = 'external' | 'embed' | 'qr';

/**
 * none - do nothing
 * disconnect - call connector.disconnect()
 */
export type WalletAbortAction = 'none' | 'disconnect';

export type CreateWalletParams<
  provider = unknown,
  properties extends Record<string, unknown> = Record<string, unknown>,
  storageItem extends Record<string, unknown> = Record<string, unknown>,
> = {
  /** unique id */
  id: string;
  /** reverse dns, or array of reverse dns for matching injected wallets */
  rdns: readonly string[];
  /** human-readable name of the wallet */
  name: string;
  /** icon for displaying in select ui */
  iconUrl: LazyValue<string>;
  /** background for icon */
  iconBackground?: string;
  /** hide the wallet from the UI */
  hidden?: boolean;
  /** what kind of ui is needed to connect, default: external */
  ui?: WalletUIType;
  /** sort priority, lower appears first */
  priority?: number;
  /** action to take when user aborts connection attempt */
  abortAction?: WalletAbortAction;
  /**
   * wagmi connector for this wallet
   * @dev SDKs needed for the wallet should be loaded in the getProvider method of the object returned by CreateConnectorFn
   **/
  createConnector: CreateConnectorFn<provider, properties, storageItem>;
};

export type Wallet<
  provider = unknown,
  properties extends Record<string, unknown> = Record<string, unknown>,
  storageItem extends Record<string, unknown> = Record<string, unknown>,
> = Required<CreateWalletParams<provider, properties, storageItem>>;
