import type { SerializedError } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { resolveAddressToDomain, resolveDomainToAddress } from '../../actions/resolver.ts';
import type { Draft } from 'immer';
import type { ResolverState } from './resolver-types.ts';

const initialResolverState: ResolverState = {
  byAddress: {},
  byDomain: {},
};

export const resolverSlice = createSlice({
  name: 'resolver',
  initialState: initialResolverState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(resolveAddressToDomain.pending, (state, action) => {
        const address = action.meta.arg.address!; // action condition: not dispatched if address is null
        setPending(state, 'byAddress', address.toLowerCase());
      })
      .addCase(resolveAddressToDomain.fulfilled, (state, action) => {
        const { address, domain } = action.payload;

        setDomainForAddress(state, address, domain);
        setAddressForDomain(state, address, domain);
      })
      .addCase(resolveAddressToDomain.rejected, (state, action) => {
        const address = action.meta.arg.address!; // action condition: not dispatched if address is null
        setRejected(state, 'byAddress', address.toLowerCase(), action.error);
      })
      .addCase(resolveDomainToAddress.pending, (state, action) => {
        const domain = action.meta.arg.domain!; // action condition: not dispatched if domain is null
        setPending(state, 'byDomain', domain.toLowerCase());
      })
      .addCase(resolveDomainToAddress.fulfilled, (state, action) => {
        const { address, domain } = action.payload;

        setDomainForAddress(state, address, domain);
        setAddressForDomain(state, address, domain);
      })
      .addCase(resolveDomainToAddress.rejected, (state, action) => {
        const domain = action.meta.arg.domain!; // action condition: not dispatched if domain is null
        setRejected(state, 'byDomain', domain.toLowerCase(), action.error);
      });
  },
});

function setPending(state: Draft<ResolverState>, stateKey: keyof ResolverState, key: string) {
  state[stateKey][key] = {
    status: 'pending',
  };
}

function setRejected(
  state: Draft<ResolverState>,
  stateKey: keyof ResolverState,
  key: string,
  error: SerializedError
) {
  state[stateKey][key] = {
    status: 'rejected',
    error,
  };
}

function setDomainForAddress(state: Draft<ResolverState>, address: string, domain: string) {
  state.byAddress[address] = {
    status: 'fulfilled',
    value: domain,
  };

  const domainState = state.byDomain[domain];
  if (!domainState || domainState.status !== 'fulfilled' || !domainState.value) {
    state.byDomain[domain] = {
      status: 'fulfilled',
      value: address,
    };
  }
}

function setAddressForDomain(state: Draft<ResolverState>, address: string, domain: string) {
  state.byDomain[domain] = {
    status: 'fulfilled',
    value: address,
  };

  const addressState = state.byAddress[address];
  if (!addressState || addressState.status !== 'fulfilled' || !addressState.value) {
    state.byAddress[address] = {
      status: 'fulfilled',
      value: domain,
    };
  }
}

export const resolverReducer = resolverSlice.reducer;
