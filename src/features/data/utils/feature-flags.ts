export function featureFlag_isDataLoaderV2Enabled() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__data_loader_v2');
}

export function featureFlag_getContractDataApiImplem():
  | 'eth-multicall'
  | 'new-multicall'
  | 'webworker-eth-multicall' {
  const params = new URLSearchParams(window.location.search);
  // default is eth-multicall
  if (!params.has('__contract_data_api')) {
    return 'eth-multicall';
  }
  const implem = params.get('__contract_data_api');
  if (
    implem === 'eth-multicall' ||
    implem === 'new-multicall' ||
    implem === 'webworker-eth-multicall'
  ) {
    return implem;
  }
  // default is eth-multicall
  return 'eth-multicall';
}

export function featureFlag_dataPolling() {
  const params = new URLSearchParams(window.location.search);
  return params.has('__polling');
}
