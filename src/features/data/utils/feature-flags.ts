import type { ChainEntity } from '../entities/chain';

const DEFAULT_CHUNK_SIZE = 468;
const DEFAULT_CHUNK_SIZE_BY_CHAIN: Record<string, number> = {
  fantom: 200,
};

let searchParamsCache: URLSearchParams | undefined;
function getSearchParams(): URLSearchParams {
  if (!searchParamsCache) {
    searchParamsCache = new URLSearchParams(window.location.search);
  }
  return searchParamsCache;
}

export function featureFlag_getContractDataApiImplem():
  | 'eth-multicall'
  | 'new-multicall'
  | 'webworker-eth-multicall' {
  const params = getSearchParams();
  // default is new-multicall
  if (!params.has('__contract_data_api')) {
    return 'new-multicall';
  }
  const implem = params.get('__contract_data_api');
  if (
    implem === 'eth-multicall' ||
    implem === 'new-multicall' ||
    implem === 'webworker-eth-multicall'
  ) {
    return implem;
  }
  // default is new-multicall
  return 'new-multicall';
}

export function featureFlag_getContractDataApiChunkSize(chain: ChainEntity['id']): number {
  const params = getSearchParams();
  if (params.has(`__contract_data_api_chunk_size_${chain}`)) {
    return parseInt(params.get(`__contract_data_api_chunk_size_${chain}`));
  }
  if (params.has('__contract_data_api_chunk_size')) {
    return parseInt(params.get('__contract_data_api_chunk_size'));
  }
  if (chain in DEFAULT_CHUNK_SIZE_BY_CHAIN) {
    return DEFAULT_CHUNK_SIZE_BY_CHAIN[chain];
  }
  return DEFAULT_CHUNK_SIZE;
}

export function featureFlag_getBalanceApiImplem(): 'eth-multicall' | 'new-multicall' {
  const params = getSearchParams();
  // default is eth-multicall
  if (!params.has('__balance_api')) {
    return 'new-multicall';
  }
  const implem = params.get('__balance_api');
  if (implem === 'eth-multicall' || implem === 'new-multicall') {
    return implem;
  }
  // default is eth-multicall
  return 'new-multicall';
}
export function featureFlag_getBalanceApiChunkSize(): number {
  const params = getSearchParams();
  // default is eth-multicall
  if (params.has('__balance_api_chunk_size')) {
    return parseInt(params.get('__balance_api_chunk_size'));
  }
  return 1024;
}

export function featureFlag_getAllowanceApiImplem(): 'eth-multicall' | 'new-multicall' {
  const params = getSearchParams();
  // default is eth-multicall
  if (!params.has('__allowance_api')) {
    return 'new-multicall';
  }
  const implem = params.get('__allowance_api');
  if (implem === 'eth-multicall' || implem === 'new-multicall') {
    return implem;
  }
  // default is eth-multicall
  return 'new-multicall';
}

export function featureFlag_getAllowanceApiChunkSize(): number {
  const params = getSearchParams();
  // default is eth-multicall
  if (params.has('__allowance_api_chunk_size')) {
    return parseInt(params.get('__allowance_api_chunk_size'));
  }
  return 500;
}

export function featureFlag_noDataPolling() {
  const params = getSearchParams();
  return params.has('__no_polling');
}

export function featureFlag_debugOnRamp() {
  const params = getSearchParams();
  return params.has('__debug_onramp');
}

export function featureFlag_walletAddressOverride(walletAddress: string | null | undefined) {
  const params = getSearchParams();
  if (walletAddress && params.has('__view_as')) {
    return params.get('__view_as');
  } else {
    return walletAddress;
  }
}

export function featureFlag_recordReduxActions() {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = getSearchParams();
  return params.has('__record_redux_actions');
}

export function featureFlag_logReduxActions() {
  const params = getSearchParams();
  return params.has('__log_redux_actions');
}

export function featureFlag_logging() {
  const params = getSearchParams();
  return params.has('__logging');
}

export function featureFlag_replayReduxActions() {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = getSearchParams();
  return params.has('__replay_redux_actions');
}

export function featureFlag_simulateRpcError(chainId: ChainEntity['id']) {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = getSearchParams();
  if (params.has('__simulate_rpc_error')) {
    const chainIds = params.get('__simulate_rpc_error').split(',');
    return chainIds.includes(chainId);
  }
}

export function featureFlag_simulateBeefyApiError(
  key:
    | 'apy'
    | 'prices'
    | 'lps'
    | 'buyback'
    | 'lpsBreakdown'
    | 'fees'
    | 'treasury'
    | 'snapshot'
    | 'zap-support'
) {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = getSearchParams();
  if (params.has('__simulate_beefy_error')) {
    const chainIds = params.get('__simulate_beefy_error').split(',');
    return chainIds.includes(key);
  }
}

export function featureFlag_breakpoints() {
  const params = getSearchParams();
  return params.has('__breakpoints');
}

type ZapOverrides = {
  beefy: 'all' | string[];
  oneInch: 'all' | string[];
};
export function featureFlag_zapSupportOverrides(): ZapOverrides {
  const params = getSearchParams();
  const overrides: ZapOverrides = {
    beefy: [],
    oneInch: [],
  };
  for (const kind of ['beefy', 'oneInch'] as const) {
    const key = `__${kind}_zap_support`;
    if (params.has(key)) {
      const enabled = params.get(key);
      if (enabled === 'all') {
        overrides[kind] = 'all';
      } else {
        overrides[kind] = enabled.split(',');
      }
    }
  }

  return overrides;
}

export function featureFlag_walletConnectChainId(): number {
  const params = getSearchParams();
  if (params.has('__wc_chain_id')) {
    const maybeId = params.get('__wc_chain_id');
    if (maybeId) {
      const chainId = parseInt(maybeId);
      if (chainId) {
        return chainId;
      }
    }
  }
  return 1;
}
