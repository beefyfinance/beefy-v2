import type { AllChainsFromTldToChain } from '../../types.ts';
import { makeEnsResolver } from '../ens-common.ts';
import type { tldToChain } from './tlds.ts';

// https://github.com/base/basenames
const { domainToAddress, addressToDomain } = makeEnsResolver<
  AllChainsFromTldToChain<typeof tldToChain>
>(
  {
    base: '0xB94704422c2a1E396835A571837Aa5AE53285a95',
  },
  {
    base: '0x79EA96012eEa67A83431F1701B3dFf7e37F9E282',
  }
);

export { domainToAddress, addressToDomain };
