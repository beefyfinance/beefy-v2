import bscPools from '../src/config/vault/bsc.json' assert {type: 'json'};
import hecoPools from '../src/config/vault/heco.json' assert {type: 'json'};
import avalanchePools from '../src/config/vault/avax.json' assert {type: 'json'};
import polygonPools from '../src/config/vault/polygon.json' assert {type: 'json'};
import fantomPools from '../src/config/vault/fantom.json' assert {type: 'json'};
import harmonyPools from '../src/config/vault/harmony.json' assert {type: 'json'};
import arbitrumPools from '../src/config/vault/arbitrum.json' assert {type: 'json'};
import celoPools from '../src/config/vault/celo.json' assert {type: 'json'};
import moonriverPools from '../src/config/vault/moonriver.json' assert {type: 'json'};
import cronosPools from '../src/config/vault/cronos.json' assert {type: 'json'};
import auroraPools from '../src/config/vault/aurora.json' assert {type: 'json'};
import fusePools from '../src/config/vault/fuse.json' assert {type: 'json'};
import metisPools from '../src/config/vault/metis.json' assert {type: 'json'};
import moonbeamPools from '../src/config/vault/moonbeam.json' assert {type: 'json'};
import emeraldPools from '../src/config/vault/emerald.json' assert {type: 'json'};

import vaultABI from '../src/config/abi/vault.json' assert {type: 'json'};
import strategyABI from '../src/config/abi/strategy.json' assert {type: 'json'};

export const abis = {
  vaultABI,
  strategyABI
}

export const chainPools = {
    bsc: bscPools,
    // heco: hecoPools,
    avax: avalanchePools,
    polygon: polygonPools,
    // fantom: fantomPools,
    one: harmonyPools,
    arbitrum: arbitrumPools,
    celo: celoPools,
    moonriver: moonriverPools,
    cronos: cronosPools,
    aurora: auroraPools,
    fuse: fusePools,
    metis: metisPools,
    moonbeam: moonbeamPools,
    emerald: emeraldPools,
  };

export const chainRpcs = {
  bsc: process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/',
  // heco: process.env.HECO_RPC || 'https://http-mainnet.hecochain.com',
  avax: process.env.AVAX_RPC || 'https://api.avax.network/ext/bc/C/rpc',
  polygon: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
  fantom: process.env.FANTOM_RPC || 'https://rpc.ftm.tools/',
  one: process.env.HARMONY_RPC || 'https://api.harmony.one/',
  arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
  celo: process.env.CELO_RPC || 'https://forno.celo.org',
  moonriver: process.env.MOONRIVER_RPC || 'https://moonriver.api.onfinality.io/public',
  cronos: process.env.CRONOS_RPC || 'https://evm.cronos.org',
  aurora: process.env.AURORA_RPC || 'https://mainnet.aurora.dev/',
  fuse: process.env.FUSE_RPC || 'https://rpc.fuse.io',
  metis: process.env.METIS_RPC || 'https://andromeda.metis.io/?owner=1088',
  moonbeam: process.env.MOONBEAM_RPC || 'https://rpc.api.moonbeam.network',
  emerald: process.env.EMERALD_RPC || 'https://emerald.oasis.dev',
};
