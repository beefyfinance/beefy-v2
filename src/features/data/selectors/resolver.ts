import type { BeefyState } from '../../../redux-types';
import type { IdleStatus, ResolverStatus } from '../reducers/wallet/resolver-types';

const IDLE_STATUS: IdleStatus = { status: 'idle' };

export function selectDomainResolution(state: BeefyState, domain: string): ResolverStatus {
  return state.user.resolver.byDomain[(domain || '').toLowerCase()] || IDLE_STATUS;
}

export function selectAddressResolution(state: BeefyState, address: string): ResolverStatus {
  return state.user.resolver.byAddress[(address || '').toLowerCase()] || IDLE_STATUS;
}
