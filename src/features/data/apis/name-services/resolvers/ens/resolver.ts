import type { AllChainsFromTldToChain } from '../../types.ts';
import { makeEnsResolver } from '../ens-common.ts';
import type { tldToChain } from './tlds.ts';

const { domainToAddress, addressToDomain } = makeEnsResolver<
  AllChainsFromTldToChain<typeof tldToChain>
>({
  ethereum: {
    registryAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  },
});

export { domainToAddress, addressToDomain };
