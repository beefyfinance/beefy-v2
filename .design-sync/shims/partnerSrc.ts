import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/merkl.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/nexus.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/openCover.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/pooltogether.svg";
import __g0_4 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/qidao.svg";
import __g0_5 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/snapshot-logo.svg";
import __g0_6 from "/Users/artjoms/beefy/beefy-v2/src/images/partners/spiritToken.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const pathToUrl = {
  "../images/partners/merkl.svg": __g0_0,
  "../images/partners/nexus.svg": __g0_1,
  "../images/partners/openCover.svg": __g0_2,
  "../images/partners/pooltogether.svg": __g0_3,
  "../images/partners/qidao.svg": __g0_4,
  "../images/partners/snapshot-logo.svg": __g0_5,
  "../images/partners/spiritToken.svg": __g0_6,
};
const keyToUrl = createGlobLoader(pathToUrl);

export function getPartnerSrc(partnerId: string) {
  return keyToUrl([partnerId]);
}
