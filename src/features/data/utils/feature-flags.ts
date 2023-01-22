import { ChainEntity } from '../entities/chain';

export function featureFlag_getContractDataApiImplem():
  | 'eth-multicall'
  | 'new-multicall'
  | 'webworker-eth-multicall' {
  const params = new URLSearchParams(window.location.search);
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
export function featureFlag_getContractDataApiChunkSize(): number {
  const params = new URLSearchParams(window.location.search);
  // default is eth-multicall
  if (params.has('__contract_data_api_chunk_size')) {
    return parseInt(params.get('__contract_data_api_chunk_size'));
  }
  return 468;
}

export function featureFlag_getBalanceApiImplem(): 'eth-multicall' | 'new-multicall' {
  const params = new URLSearchParams(window.location.search);
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
  const params = new URLSearchParams(window.location.search);
  // default is eth-multicall
  if (params.has('__balance_api_chunk_size')) {
    return parseInt(params.get('__balance_api_chunk_size'));
  }
  return 1024;
}

export function featureFlag_getAllowanceApiImplem(): 'eth-multicall' | 'new-multicall' {
  const params = new URLSearchParams(window.location.search);
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
  const params = new URLSearchParams(window.location.search);
  // default is eth-multicall
  if (params.has('__allowance_api_chunk_size')) {
    return parseInt(params.get('__allowance_api_chunk_size'));
  }
  return 500;
}

export function featureFlag_noDataPolling() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__no_polling');
}

export function featureFlag_debugOnRamp() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__debug_onramp');
}

export function featureFlag_walletAddressOverride(walletAddress: string | null | undefined) {
  const params = new URLSearchParams(window.location.search);
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
  const params = new URLSearchParams(window.location.search);
  return params.has('__record_redux_actions');
}

export function featureFlag_logReduxActions() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__log_redux_actions');
}

export function featureFlag_logging() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__logging');
}

export function featureFlag_replayReduxActions() {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return params.has('__replay_redux_actions');
}

export function featureFlag_simulateRpcError(chainId: ChainEntity['id']) {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.has('__simulate_rpc_error')) {
    const chainIds = params.get('__simulate_rpc_error').split(',');
    return chainIds.includes(chainId);
  }
}

export function featureFlag_simulateBeefyApiError(
  key: 'apy' | 'prices' | 'lps' | 'buyback' | 'lpsBreakdown' | 'fees' | 'treasury'
) {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.has('__simulate_beefy_error')) {
    const chainIds = params.get('__simulate_beefy_error').split(',');
    return chainIds.includes(key);
  }
}

export function featureFlag_breakpoints() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__breakpoints');
}
