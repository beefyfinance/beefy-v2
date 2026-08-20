import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/boosts/arb.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/boosts/clm.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/boosts/zap.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const pathToUrl = {
  "../images/boosts/arb.svg": __g0_0,
  "../images/boosts/clm.svg": __g0_1,
  "../images/boosts/zap.svg": __g0_2,
};
const keyToUrl = createGlobLoader(pathToUrl);

export function getBoostIconSrc(name: string) {
  return keyToUrl([name]);
}
