import type { WalletInit } from '@web3-onboard/common';
import { createEIP1193Provider, ProviderRpcError } from '@web3-onboard/common';
import oathIconUrl from '../../../../images/wallets/oath-wallet.svg?url';

export const oathWallet = {
  id: 'oath-wallet',
  name: 'Oath Wallet',
  homepage: 'https://oathwallet.org',
  image_url: oathIconUrl,
  mobile_link: 'oathwallet://',
  app_store: 'https://apps.apple.com/app/id6780187283',
};

export function createOathWalletModule(projectId: string, requiredChainId?: number): WalletInit {
  return ({ device }) => {
    if (device.os?.name === 'Android') {
      return null;
    }

    return {
      label: oathWallet.name,
      getIcon: async () => (await import('../../../../images/wallets/oath-wallet.svg')).default,
      getInterface: async ({ chains, appMetadata }) => {
        const [firstChain, ...otherChains] = chains;
        if (!firstChain) {
          throw new Error('Oath Wallet requires at least one configured chain');
        }
        const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
        const { ModalController, RouterController } = await import('@reown/appkit-controllers');
        const connector = await EthereumProvider.init({
          projectId,
          customStoragePrefix: 'beefy-oath-wallet',
          chains: requiredChainId ? [requiredChainId] : [],
          optionalChains: [Number(firstChain.id), ...otherChains.map(({ id }) => Number(id))],
          optionalMethods: [
            'eth_sendTransaction',
            'eth_signTransaction',
            'personal_sign',
            'eth_sign',
            'eth_signTypedData',
            'eth_signTypedData_v4',
            'wallet_addEthereumChain',
            'wallet_switchEthereumChain',
          ],
          rpcMap: Object.fromEntries(chains.map(({ id, rpcUrl }) => [Number(id), rpcUrl || ''])),
          showQrModal: true,
          metadata: {
            name: appMetadata?.name || 'Beefy',
            description: appMetadata?.description || '',
            url: 'https://app.beefy.com',
            icons: [appMetadata?.icon, appMetadata?.logo].filter((icon): icon is string => !!icon),
          },
        });

        // Use Onboard's provider bridge and card. Only the account-connection
        // screen is branded; RPC requests and provider events stay native.
        const provider = createEIP1193Provider(connector, {
          eth_selectAccounts: null,
          eth_requestAccounts: async ({ baseRequest }) => {
            if (connector.session) {
              return baseRequest({ method: 'eth_accounts' });
            }

            const unsubscribe = ModalController.subscribeKey('open', open => {
              if (open) {
                RouterController.reset('ConnectingWalletConnect', { wallet: oathWallet });
              }
            });
            try {
              await connector.connect();
              return await baseRequest({ method: 'eth_accounts' });
            } catch (error) {
              // EthereumProvider reports modal cancellation as an ordinary
              // Error. Onboard needs EIP-1193 code 4001 to show its retry UI.
              if (
                error instanceof Error &&
                error.message === 'Connection request reset. Please try again.'
              ) {
                throw new ProviderRpcError({ code: 4001, message: 'Connection cancelled.' });
              }
              throw error;
            } finally {
              unsubscribe();
            }
          },
        });

        return { provider, instance: connector };
      },
    };
  };
}
