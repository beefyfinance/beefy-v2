import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { selectAllChainIds, selectChainById } from '../selectors/chains';
import { getNameServicesApi } from '../apis/instances';
import type { ChainEntity, ChainId } from '../entities/chain';

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
    if (!address || !address.length) {
      throw new Error('No address provided');
    }

    const state = getState();
    const chainIdToEntity = selectAllChainIds(state).reduce((acc, chainId) => {
      acc[chainId] = selectChainById(state, chainId);
      return acc;
    }, {} as Record<ChainId, ChainEntity>);
    const nameServices = await getNameServicesApi(chainIdToEntity);
    const domain = await nameServices.resolveAddressToDomain(address);

    if (!domain) {
      throw new Error('No domain found');
    }

    return {
      address: address.toLowerCase(),
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
    if (!domain || !domain.length) {
      throw new Error('No domain provided');
    }

    const state = getState();
    const chainIdToEntity = selectAllChainIds(state).reduce((acc, chainId) => {
      acc[chainId] = selectChainById(state, chainId);
      return acc;
    }, {} as Record<ChainId, ChainEntity>);
    const nameServices = await getNameServicesApi(chainIdToEntity);
    const address = await nameServices.resolveDomainToAddress(domain);

    if (!address) {
      throw new Error('No address found');
    }

    return {
      address: address,
      domain: domain.toLowerCase(),
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
