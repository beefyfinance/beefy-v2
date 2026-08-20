import __g0_0 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/arbitrum.svg";
import __g0_1 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/aurora.svg";
import __g0_2 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/avax.svg";
import __g0_3 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/base.svg";
import __g0_4 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/base_square.svg";
import __g0_5 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/berachain.svg";
import __g0_6 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/bsc.svg";
import __g0_7 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/canto.svg";
import __g0_8 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/celo.svg";
import __g0_9 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/cronos.svg";
import __g0_10 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/emerald.svg";
import __g0_11 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/ethereum.svg";
import __g0_12 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/ethereum_square.svg";
import __g0_13 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/fantom.svg";
import __g0_14 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/fraxtal.svg";
import __g0_15 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/fuse.svg";
import __g0_16 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/gnosis.svg";
import __g0_17 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/harmony.svg";
import __g0_18 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/heco.svg";
import __g0_19 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/hyperevm.svg";
import __g0_20 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/kava.svg";
import __g0_21 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/linea.svg";
import __g0_22 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/lisk.svg";
import __g0_23 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/manta.svg";
import __g0_24 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/mantle.svg";
import __g0_25 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/megaeth.svg";
import __g0_26 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/metis.svg";
import __g0_27 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/mode.svg";
import __g0_28 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/monad.svg";
import __g0_29 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/moonbeam.svg";
import __g0_30 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/moonriver.svg";
import __g0_31 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/optimism.svg";
import __g0_32 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/optimism_square.svg";
import __g0_33 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/plasma.svg";
import __g0_34 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/polygon.svg";
import __g0_35 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/real.svg";
import __g0_36 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/robinhood.svg";
import __g0_37 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/rootstock.svg";
import __g0_38 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/saga.svg";
import __g0_39 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/scroll.svg";
import __g0_40 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/sei.svg";
import __g0_41 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/sonic.svg";
import __g0_42 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/sonic_square.svg";
import __g0_43 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/zkevm.svg";
import __g0_44 from "/Users/artjoms/beefy/beefy-v2/src/images/networks/zksync.svg";
import type { ChainEntity } from '../features/data/entities/chain.ts';
import { createGlobLoader } from '../../src/helpers/globLoader.ts';

const pathToUrl = {
  "../images/networks/arbitrum.svg": __g0_0,
  "../images/networks/aurora.svg": __g0_1,
  "../images/networks/avax.svg": __g0_2,
  "../images/networks/base.svg": __g0_3,
  "../images/networks/base_square.svg": __g0_4,
  "../images/networks/berachain.svg": __g0_5,
  "../images/networks/bsc.svg": __g0_6,
  "../images/networks/canto.svg": __g0_7,
  "../images/networks/celo.svg": __g0_8,
  "../images/networks/cronos.svg": __g0_9,
  "../images/networks/emerald.svg": __g0_10,
  "../images/networks/ethereum.svg": __g0_11,
  "../images/networks/ethereum_square.svg": __g0_12,
  "../images/networks/fantom.svg": __g0_13,
  "../images/networks/fraxtal.svg": __g0_14,
  "../images/networks/fuse.svg": __g0_15,
  "../images/networks/gnosis.svg": __g0_16,
  "../images/networks/harmony.svg": __g0_17,
  "../images/networks/heco.svg": __g0_18,
  "../images/networks/hyperevm.svg": __g0_19,
  "../images/networks/kava.svg": __g0_20,
  "../images/networks/linea.svg": __g0_21,
  "../images/networks/lisk.svg": __g0_22,
  "../images/networks/manta.svg": __g0_23,
  "../images/networks/mantle.svg": __g0_24,
  "../images/networks/megaeth.svg": __g0_25,
  "../images/networks/metis.svg": __g0_26,
  "../images/networks/mode.svg": __g0_27,
  "../images/networks/monad.svg": __g0_28,
  "../images/networks/moonbeam.svg": __g0_29,
  "../images/networks/moonriver.svg": __g0_30,
  "../images/networks/optimism.svg": __g0_31,
  "../images/networks/optimism_square.svg": __g0_32,
  "../images/networks/plasma.svg": __g0_33,
  "../images/networks/polygon.svg": __g0_34,
  "../images/networks/real.svg": __g0_35,
  "../images/networks/robinhood.svg": __g0_36,
  "../images/networks/rootstock.svg": __g0_37,
  "../images/networks/saga.svg": __g0_38,
  "../images/networks/scroll.svg": __g0_39,
  "../images/networks/sei.svg": __g0_40,
  "../images/networks/sonic.svg": __g0_41,
  "../images/networks/sonic_square.svg": __g0_42,
  "../images/networks/zkevm.svg": __g0_43,
  "../images/networks/zksync.svg": __g0_44,
};
const keyToUrl = createGlobLoader(pathToUrl);

export function getNetworkSrc(chainId: ChainEntity['id']) {
  return keyToUrl([chainId]);
}
