import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/ankr.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/axelar.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/base.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/bittorrent.svg";
import __g0_4 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/celer.svg";
import __g0_5 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/chainlink-ccip.svg";
import __g0_6 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/connext.svg";
import __g0_7 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/frax.svg";
import __g0_8 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/gravity.svg";
import __g0_9 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/hop.svg";
import __g0_10 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/ibc.svg";
import __g0_11 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/idrx.svg";
import __g0_12 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/kusama.svg";
import __g0_13 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/layer-zero.svg";
import __g0_14 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/multichain.svg";
import __g0_15 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/optics.svg";
import __g0_16 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/ren.svg";
import __g0_17 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/stargate.svg";
import __g0_18 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/synapse.svg";
import __g0_19 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/threshold.svg";
import __g0_20 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/wbtc-dao.svg";
import __g0_21 from "/Users/artjoms/beefy/beefy-v2/src/images/bridges/wormhole.svg";
import { createGlobLoader } from '../../src/helpers/globLoader.ts';
import type { BridgeEntity } from '../features/data/entities/bridge.ts';

const iconPathToUrl = {
  "../images/bridges/ankr.svg": __g0_0,
  "../images/bridges/axelar.svg": __g0_1,
  "../images/bridges/base.svg": __g0_2,
  "../images/bridges/bittorrent.svg": __g0_3,
  "../images/bridges/celer.svg": __g0_4,
  "../images/bridges/chainlink-ccip.svg": __g0_5,
  "../images/bridges/connext.svg": __g0_6,
  "../images/bridges/frax.svg": __g0_7,
  "../images/bridges/gravity.svg": __g0_8,
  "../images/bridges/hop.svg": __g0_9,
  "../images/bridges/ibc.svg": __g0_10,
  "../images/bridges/idrx.svg": __g0_11,
  "../images/bridges/kusama.svg": __g0_12,
  "../images/bridges/layer-zero.svg": __g0_13,
  "../images/bridges/multichain.svg": __g0_14,
  "../images/bridges/optics.svg": __g0_15,
  "../images/bridges/ren.svg": __g0_16,
  "../images/bridges/stargate.svg": __g0_17,
  "../images/bridges/synapse.svg": __g0_18,
  "../images/bridges/threshold.svg": __g0_19,
  "../images/bridges/wbtc-dao.svg": __g0_20,
  "../images/bridges/wormhole.svg": __g0_21,
};

const keyToUrl = createGlobLoader(iconPathToUrl);

export function getAssetBridgeIcon(id: BridgeEntity['id']) {
  return keyToUrl(id);
}
