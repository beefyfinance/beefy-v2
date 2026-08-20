import type { ResolverStatus } from '../reducers/wallet/resolver-types';
import type { BeefyState } from '../store/types';
export declare function selectDomainResolution(state: BeefyState, domain: string): ResolverStatus;
export declare function selectAddressResolution(state: BeefyState, address: string | undefined): ResolverStatus;
