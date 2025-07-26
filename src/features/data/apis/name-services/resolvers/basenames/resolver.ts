import type { AllChainsFromTldToChain } from '../../types.ts';
import { chainIdToReverseDomain } from '../../utils.ts';
import { makeEnsResolver } from '../ens-common.ts';
import type { tldToChain } from './tlds.ts';

// https://github.com/base/basenames
const { domainToAddress, addressToDomain } = makeEnsResolver<
  AllChainsFromTldToChain<typeof tldToChain>
>({
  base: {
    registryAddress: '0xB94704422c2a1E396835A571837Aa5AE53285a95',
    reverseDomain: chainIdToReverseDomain(8453),
  },
});

export { domainToAddress, addressToDomain };
