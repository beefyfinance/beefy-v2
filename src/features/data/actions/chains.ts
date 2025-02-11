import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import type { ChainConfig } from '../apis/config-types';
import type { ChainEntity, ChainId } from '../entities/chain';
import { isObject } from 'lodash-es';

export interface FulfilledPayload {
  chainConfigs: ChainConfig[];
  localRpcs: Partial<Record<ChainEntity['id'], string[]>>;
}

const fetchLocalStoredRpcs = (): Partial<Record<ChainEntity['id'], string[]>> => {
  try {
    const readStorage = window?.localStorage.getItem('activeRpcsByChainId');
    if (readStorage && readStorage.startsWith('{') && readStorage.endsWith('}')) {
      const parsedValues = JSON.parse(readStorage);
      if (
        isObject(parsedValues) &&
        Object.values(parsedValues).every(
          arr => Array.isArray(arr) && arr.every(elem => typeof elem === 'string')
        )
      ) {
        return parsedValues;
      }
    }
    window?.localStorage.setItem('activeRpcsByChainId', JSON.stringify({}));
  } catch {
    console.warn('Failed to read activeRpcsByChainId from localStorage');
  }

  return {};
};

const addLocalStoredRpcs = (chainId: ChainId, rpc: string) => {
  try {
    const readStorage = window?.localStorage.getItem('activeRpcsByChainId');
    const parsedValues = readStorage ? JSON.parse(readStorage) : {};
    if (isObject(parsedValues)) {
      parsedValues[chainId] = [rpc];
      window?.localStorage.setItem('activeRpcsByChainId', JSON.stringify(parsedValues));
    }
  } catch {
    console.warn('Failed to write activeRpcsByChainId to localStorage');
  }
};

const removeLocalStoredRpcs = (chainId: ChainId) => {
  try {
    const readStorage = window?.localStorage.getItem('activeRpcsByChainId');
    const parsedValues = readStorage ? JSON.parse(readStorage) : {};
    if (isObject(parsedValues)) {
      if (parsedValues[chainId]) {
        delete parsedValues[chainId];
        window?.localStorage.setItem('activeRpcsByChainId', JSON.stringify(parsedValues));
      }
    }
  } catch {
    console.warn('Failed to write activeRpcsByChainId to localStorage');
  }
};

export const fetchChainConfigs = createAsyncThunk<FulfilledPayload>(
  'chains/fetchChainConfigs',
  async () => {
    const api = await getConfigApi();
    const chainConfigs = await api.fetchChainConfigs();
    const localRpcs = fetchLocalStoredRpcs();
    return { chainConfigs, localRpcs };
  }
);

export const updateActiveRpc = createAction(
  'updateActiveRpc',
  (chainId: ChainId, rpcUrl: string) => {
    addLocalStoredRpcs(chainId, rpcUrl);
    return {
      payload: { chainId, rpcUrl },
    };
  }
);

export const restoreDefaultRpcsOnSingleChain = createAction(
  'restoreDefaultRpcsOnSingleChain',
  (chainId: ChainId) => {
    removeLocalStoredRpcs(chainId);
    return {
      payload: { chainId },
    };
  }
);
