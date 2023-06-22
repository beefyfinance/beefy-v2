import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { selectChainById } from '../selectors/chains';
import {
  getAddressDomains,
  isValidAddress,
  isMaybeDomain,
  getDomainAddress,
} from '../../../helpers/addresses';

type ResolveFulfilledPayload = {
  address: string;
  domain: string;
};

export type ResolveAddressToDomainArgs = {
  address?: string | null | undefined;
};

export const resolveAddressToDomain = createAsyncThunk<
  ResolveFulfilledPayload,
  ResolveAddressToDomainArgs,
  { state: BeefyState }
>(
  'resolver/addressToDomain',
  async ({ address }, { getState }) => {
    if (!isValidAddress(address)) {
      throw new Error('Invalid address');
    }

    const addressLower = address.toLowerCase();
    const state = getState();
    const bscChain = selectChainById(state, 'bsc');
    const ethChain = selectChainById(state, 'ethereum');
    const polygonChain = selectChainById(state, 'polygon');
    const arbChain = selectChainById(state, 'arbitrum');

    const domains = await getAddressDomains(address, [bscChain, ethChain, polygonChain, arbChain]);
    const domain = domains?.[0] || '';

    if (!domain) {
      throw new Error('No domain found');
    }

    return {
      address: addressLower,
      domain: domain,
    };
  },
  {
    condition: ({ address }, { getState }) => {
      // skip if fired with null address
      if (!address) {
        return false;
      }

      // only fetch if we haven't previously fetched this address
      const state = getState();
      const addressLower = address.toLowerCase();
      const status = state.user.resolver.byAddress[addressLower]?.status || 'idle';
      return status === 'idle';
    },
  }
);

export type ResolveDomainToAddressArgs = {
  domain?: string | null | undefined;
};

export const resolveDomainToAddress = createAsyncThunk<
  ResolveFulfilledPayload,
  ResolveDomainToAddressArgs,
  { state: BeefyState }
>(
  'resolver/domainToAddress',
  async ({ domain }, { getState }) => {
    if (!isMaybeDomain(domain)) {
      throw new Error('Invalid domain');
    }

    const domainLower = domain.toLowerCase();
    const state = getState();
    const bscChain = selectChainById(state, 'bsc');
    const ethChain = selectChainById(state, 'ethereum');
    const polygonChain = selectChainById(state, 'polygon');
    const arbChain = selectChainById(state, 'arbitrum');
    const address = await getDomainAddress(domainLower, [
      bscChain,
      ethChain,
      polygonChain,
      arbChain,
    ]);

    if (!address) {
      throw new Error('No address found');
    }

    return {
      address: address,
      domain: domainLower,
    };
  },
  {
    condition: ({ domain }, { getState }) => {
      // skip if fired with null domain
      if (!domain) {
        return false;
      }

      // only fetch if we haven't previously fetched this address
      const state = getState();
      const domainLower = domain.toLowerCase();
      const status = state.user.resolver.byDomain[domainLower]?.status || 'idle';
      return status === 'idle';
    },
  }
);
