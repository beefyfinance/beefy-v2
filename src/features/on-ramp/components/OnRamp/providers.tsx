import { useCallback } from 'react';
import type { Quote } from '../../../data/reducers/on-ramp-types.ts';
import type { ApiUrlRequest } from '../../../data/apis/on-ramp/on-ramp-types.ts';
import { getOnRampApi } from '../../../data/apis/instances.ts';

export type ProviderType = {
  title: string;
  useFetchUrl: (quote: Quote, walletAddress?: string) => () => Promise<string>;
};

export const PROVIDERS: Record<string, Readonly<ProviderType>> = {
  transak: {
    title: 'Transak',
    useFetchUrl(quote: Quote, walletAddress?: string) {
      const { fiatAmount, fiat, tokenAmount, token, amountType, network, paymentMethod } = quote;
      return useCallback(async () => {
        const params: ApiUrlRequest = {
          cryptoCurrency: token,
          fiatCurrency: fiat,
          amountType: amountType === 'token' ? 'crypto' : 'fiat',
          amount: amountType === 'token' ? tokenAmount : fiatAmount,
          network: network,
          provider: 'transak',
          paymentMethod: paymentMethod,
        };

        if (walletAddress) {
          params.address = walletAddress;
        }

        const api = await getOnRampApi();
        return await api.getUrl(params);
      }, [fiatAmount, fiat, tokenAmount, token, amountType, network, paymentMethod, walletAddress]);
    },
  },
  mtpelerin: {
    title: 'Mt Pelerin',
    useFetchUrl(quote: Quote, walletAddress?: string) {
      const { fiatAmount, fiat, tokenAmount, token, amountType, network, paymentMethod } = quote;
      return useCallback(async () => {
        const params: ApiUrlRequest = {
          cryptoCurrency: token,
          fiatCurrency: fiat,
          amountType: amountType === 'token' ? 'crypto' : 'fiat',
          amount: amountType === 'token' ? tokenAmount : fiatAmount,
          network: network,
          provider: 'mtpelerin',
          paymentMethod: paymentMethod,
        };

        if (walletAddress) {
          params.address = walletAddress;
        }

        const api = await getOnRampApi();
        return await api.getUrl(params);
      }, [fiatAmount, fiat, tokenAmount, token, amountType, network, paymentMethod, walletAddress]);
    },
  },
};
