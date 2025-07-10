import type { ChainEntity } from '../entities/chain.ts';
import { clamp } from '../../../helpers/number.ts';
import { createFactory } from './factory-utils.ts';

const DEFAULT_CHUNK_SIZE = 468;
const DEFAULT_CHUNK_SIZE_BY_CHAIN: Record<string, number> = {
  fantom: 200,
};

const getSearchParams = createFactory((): URLSearchParams => {
  return new URLSearchParams(window.location.search);
});

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

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

  const chainChunkSize = params.get(`__contract_data_api_chunk_size_${chain}`);
  if (chainChunkSize) {
    return parseInt(chainChunkSize);
  }

  const globalChunkSize = params.get('__contract_data_api_chunk_size');
  if (globalChunkSize) {
    return parseInt(globalChunkSize);
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
  return getParam('__balance_api_chunk_size', 1024, parseInt);
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

function getParam<T>(key: string, defaultValue: T, parser?: (value: string) => T): T {
  const params = getSearchParams();
  const maybeValue = params.get(key);

  if (maybeValue) {
    if (parser) {
      return parser(maybeValue);
    } else if (typeof defaultValue === 'string') {
      return maybeValue as T;
    } else {
      throw new Error(`No parser for ${key}`);
    }
  }

  return defaultValue;
}

export function featureFlag_getAllowanceApiChunkSize(): number {
  return getParam('__allowance_api_chunk_size', 500, parseInt);
}

export function featureFlag_noDataPolling() {
  const params = getSearchParams();
  return params.has('__no_polling');
}

export function featureFlag_debugOnRamp() {
  const params = getSearchParams();
  return params.has('__debug_onramp');
}

export function featureFlag_walletAddressOverride(walletAddress: string) {
  if (walletAddress) {
    return getParam('__view_as', walletAddress);
  }

  return walletAddress;
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
    const chainIds = (params.get('__simulate_rpc_error') || '').split(',');
    return chainIds.includes(chainId);
  }
}

export function featureFlag_simulateBeefyApiError(
  key:
    | 'apy'
    | 'prices'
    | 'lps'
    | 'lpsBreakdown'
    | 'fees'
    | 'treasury'
    | 'snapshot'
    | 'zap-support'
    | 'articles'
    | 'historical-prices'
) {
  const isAuthorizedDomain =
    window.location.hostname.endsWith('fleek.co') || window.location.hostname.endsWith('localhost');
  if (!isAuthorizedDomain) {
    return false;
  }
  const params = getSearchParams();
  if (params.has('__simulate_beefy_error')) {
    const chainIds = (params.get('__simulate_beefy_error') || '').split(',');
    return chainIds.includes(key);
  }
}

export function featureFlag_breakpoints() {
  const params = getSearchParams();
  return params.has('__breakpoints');
}

export function featureFlag_walletConnectChainId(): number | undefined {
  return getParam<undefined | number>('__chain_id', undefined, parseInt);
}

export function featureFlag_simulateBridgeRateLimit(): boolean {
  const params = getSearchParams();
  return params.has('__simulate_bridge_rate_limit');
}

export function featureFlag_simulateAllBridgeRateLimit(): boolean {
  const params = getSearchParams();
  return params.has('__simulate_all_bridge_rate_limit');
}

export function featureFlag_oneInchSupport(): {
  chainId: string;
  tokenAddress: string;
}[] {
  const params = getSearchParams();
  if (params.has('__oneinch_support')) {
    return (params.get('__oneinch_support') || '').split(',').map(s => {
      const [chainId, tokenAddress] = s.split(':');
      return { chainId, tokenAddress };
    });
  }
  return [];
}

export function featureFlag_kyberSwapSupport(): {
  chainId: string;
  tokenAddress: string;
}[] {
  const params = getSearchParams();
  if (params.has('__kyber_support')) {
    return (params.get('__kyber_support') || '').split(',').map(s => {
      const [chainId, tokenAddress] = s.split(':');
      return { chainId, tokenAddress };
    });
  }
  return [];
}

export function featureFlag_odosSwapSupport(): {
  chainId: string;
  tokenAddress: string;
}[] {
  const params = getSearchParams();
  if (params.has('__odos_support')) {
    return (params.get('__odos_support') || '').split(',').map(s => {
      const [chainId, tokenAddress] = s.split(':');
      return { chainId, tokenAddress };
    });
  }
  return [];
}

export function featureFlag_liquidSwapSupport(): {
  chainId: string;
  tokenAddress: string;
}[] {
  const params = getSearchParams();
  if (params.has('__liquid_support')) {
    return (params.get('__liquid_support') || '').split(',').map(s => {
      const [chainId, tokenAddress] = s.split(':');
      return { chainId, tokenAddress };
    });
  }
  return [];
}

export function featureFlag_disableOneInch(): boolean {
  const params = getSearchParams();
  return params.has('__disable_one_inch');
}

export function featureFlag_disableKyber(): boolean {
  const params = getSearchParams();
  return params.has('__disable_kyber');
}

export function featureFlag_disableOdos(): boolean {
  const params = getSearchParams();
  return params.has('__disable_odos');
}

export function featureFlag_disableLiquidSwap(): boolean {
  const params = getSearchParams();
  return params.has('__disable_liquid');
}

export function featureFlag_detailedTooltips(): boolean {
  if (import.meta.env.VITE_DETAILED_TOOLTIPS === 'true') {
    return true;
  }
  const params = getSearchParams();
  return params.has('__detailed_tooltips');
}

export function featureFlag_simUpdate(): boolean {
  const params = getSearchParams();
  return params.has('__sim_update');
}

export function featureFlag_disableRedirect(): boolean {
  const params = getSearchParams();
  return params.has('__disable_redirect');
}

export function featureFlag_simulateMerklApiFailure(): number | false {
  const params = getSearchParams();
  if (!params.has('__simulate_merkl_api_failure')) {
    return false;
  }

  return clamp(parseFloat(params.get('__simulate_merkl_api_failure') || '0'), 0, 1);
}

const getSimulateLiveBoosts = createFactory((): Set<string> => {
  const params = getSearchParams();
  const boostIds = (params.get('__simulate_live_boost') || '').split(',');
  return new Set(boostIds);
});

export function featureFlag_simulateLiveBoost(boostId: string): boolean {
  const boostIds = getSimulateLiveBoosts();
  return boostIds.has(boostId);
}

export function featureFlag_simulateMissingTransactions(): boolean {
  return getSearchParams().has('__simulate_missing_transactions');
}
