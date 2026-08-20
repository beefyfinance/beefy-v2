import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/transact-providers/cctp.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/transact-providers/kyber.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/transact-providers/liquid-swap.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/transact-providers/one-inch.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const pathToUrl = {
  "../images/transact-providers/cctp.svg": __g0_0,
  "../images/transact-providers/kyber.svg": __g0_1,
  "../images/transact-providers/liquid-swap.svg": __g0_2,
  "../images/transact-providers/one-inch.svg": __g0_3,
};

const keyToUrl = createGlobLoader(pathToUrl);

export function getTransactProviderIcon(provider: string) {
  return keyToUrl([provider]);
}
