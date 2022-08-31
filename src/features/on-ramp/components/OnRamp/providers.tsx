import { useCallback } from 'react';
import { Quote } from '../../../data/reducers/on-ramp-types';
import { ApiUrlRequest } from '../../../data/apis/on-ramp/on-ramp-types';
import { getOnRampApi } from '../../../data/apis/instances';

export type ProviderType = {
  title: string;
  useFetchUrl: (quote: Quote, walletAddress?: string) => () => Promise<string>;
};

export const PROVIDERS: Record<string, Readonly<ProviderType>> = {
  binance: {
    title: 'Binance Connect',
    useFetchUrl(quote: Quote, walletAddress?: string) {
      const { fiatAmount, fiat, token, network, paymentMethod } = quote;
      return useCallback(async () => {
        const params: ApiUrlRequest = {
          cryptoCurrency: token,
          fiatCurrency: fiat,
          amountType: 'fiat',
          amount: fiatAmount,
          network: network,
          provider: 'binance',
          paymentMethod: paymentMethod,
        };

        if (walletAddress) {
          params.address = walletAddress;
        }

        const api = await getOnRampApi();
        return await api.getUrl(params);
      }, [fiatAmount, fiat, token, network, paymentMethod, walletAddress]);
    },
  },
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
};
