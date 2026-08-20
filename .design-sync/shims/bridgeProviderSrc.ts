import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/icons/axelar.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/icons/chainlink.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/icons/layer-zero.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/icons/optimism.svg";
import __g1_4 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/logos/axelar.svg";
import __g1_5 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/logos/chainlink.svg";
import __g1_6 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/logos/connext.svg";
import __g1_7 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/logos/layer-zero.svg";
import __g1_8 from "/Users/artjoms/beefy/beefy-v2/src/images/bridge-providers/logos/optimism.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const iconPathToUrl = {
  "../images/bridge-providers/icons/axelar.svg": __g0_0,
  "../images/bridge-providers/icons/chainlink.svg": __g0_1,
  "../images/bridge-providers/icons/layer-zero.svg": __g0_2,
  "../images/bridge-providers/icons/optimism.svg": __g0_3,
};
const logoPathToUrl = {
  "../images/bridge-providers/logos/axelar.svg": __g1_4,
  "../images/bridge-providers/logos/chainlink.svg": __g1_5,
  "../images/bridge-providers/logos/connext.svg": __g1_6,
  "../images/bridge-providers/logos/layer-zero.svg": __g1_7,
  "../images/bridge-providers/logos/optimism.svg": __g1_8,
};

const iconKeyToUrl = createGlobLoader(iconPathToUrl);
const logoKeyToUrl = createGlobLoader(logoPathToUrl);

export function getBridgeProviderIcon(provider: string) {
  return iconKeyToUrl(provider);
}

export function getBridgeProviderLogo(provider: string) {
  return logoKeyToUrl(provider);
}
