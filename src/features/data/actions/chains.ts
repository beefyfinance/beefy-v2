import { createAction } from '@reduxjs/toolkit';
import { isObject, isPlainObject } from 'lodash-es';
import type { ChainConfig } from '../apis/config-types.ts';
import { getConfigApi } from '../apis/instances.ts';
import { rpcClientManager } from '../apis/rpc-contract/rpc-manager.ts';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

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
    if (isPlainObject(parsedValues)) {
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
    if (isPlainObject(parsedValues)) {
      if (parsedValues[chainId]) {
        delete parsedValues[chainId];
        window?.localStorage.setItem('activeRpcsByChainId', JSON.stringify(parsedValues));
      }
    }
  } catch {
    console.warn('Failed to write activeRpcsByChainId to localStorage');
  }
};

export const fetchChainConfigs = createAppAsyncThunk<FulfilledPayload>(
  'chains/fetchChainConfigs',
  async () => {
    const api = await getConfigApi();
    const chainConfigs = await api.fetchChainConfigs();
    const localRpcs = fetchLocalStoredRpcs();
    for (const chain of chainConfigs) {
      rpcClientManager.setClients(chain, localRpcs[chain.id] || chain.rpc);
    }
    return { chainConfigs, localRpcs };
  }
);

export const updateActiveRpc = createAction(
  'updateActiveRpc',
  (chain: ChainEntity, rpcUrl: string) => {
    rpcClientManager.setClients(chain, [rpcUrl]);
    addLocalStoredRpcs(chain.id, rpcUrl);
    return {
      payload: { chainId: chain.id, rpcUrl },
    };
  }
);

export const restoreDefaultRpcsOnSingleChain = createAction(
  'restoreDefaultRpcsOnSingleChain',
  (chain: ChainEntity) => {
    rpcClientManager.setClients(chain, chain.rpc);
    removeLocalStoredRpcs(chain.id);
    return {
      payload: { chainId: chain.id },
    };
  }
);
