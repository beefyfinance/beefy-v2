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
  return 512;
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
  return 500;
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

export function featureFlag_dataPolling() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__polling');
}

export function featureFlag_scenarioTimings() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__scenario_timings');
}

export function featureFlag_walletAddressOverride(walletAddress: string | null | undefined) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('__view_as')) {
    return params.get('__view_as');
  } else {
    return walletAddress;
  }
}
