import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/api3.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/architect.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/august-digital.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/avantgarde.svg";
import __g0_4 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/clearstar.svg";
import __g0_5 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/edge.svg";
import __g0_6 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/euler.svg";
import __g0_7 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/gauntlet.svg";
import __g0_8 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/hyperithm.png";
import __g0_9 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/k3-capital.svg";
import __g0_10 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/keyrock.svg";
import __g0_11 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/kpk.svg";
import __g0_12 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/mev-capital.svg";
import __g0_13 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/optima.png";
import __g0_14 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/re7-labs.svg";
import __g0_15 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/sentora.svg";
import __g0_16 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/stake-dao.svg";
import __g0_17 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/steakhouse.svg";
import __g0_18 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/telosc.svg";
import __g0_19 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/ultra.svg";
import __g0_20 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/varlamore.svg";
import __g0_21 from "/Users/artjoms/beefy/beefy-v2/src/images/curators/yearn.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const pathToUrl = {
  "../images/curators/api3.svg": __g0_0,
  "../images/curators/architect.svg": __g0_1,
  "../images/curators/august-digital.svg": __g0_2,
  "../images/curators/avantgarde.svg": __g0_3,
  "../images/curators/clearstar.svg": __g0_4,
  "../images/curators/edge.svg": __g0_5,
  "../images/curators/euler.svg": __g0_6,
  "../images/curators/gauntlet.svg": __g0_7,
  "../images/curators/hyperithm.png": __g0_8,
  "../images/curators/k3-capital.svg": __g0_9,
  "../images/curators/keyrock.svg": __g0_10,
  "../images/curators/kpk.svg": __g0_11,
  "../images/curators/mev-capital.svg": __g0_12,
  "../images/curators/optima.png": __g0_13,
  "../images/curators/re7-labs.svg": __g0_14,
  "../images/curators/sentora.svg": __g0_15,
  "../images/curators/stake-dao.svg": __g0_16,
  "../images/curators/steakhouse.svg": __g0_17,
  "../images/curators/telosc.svg": __g0_18,
  "../images/curators/ultra.svg": __g0_19,
  "../images/curators/varlamore.svg": __g0_20,
  "../images/curators/yearn.svg": __g0_21,
};
const keyToUrl = createGlobLoader(pathToUrl);

export function getCuratorSrc(curatorId: string) {
  return keyToUrl([curatorId]);
}
