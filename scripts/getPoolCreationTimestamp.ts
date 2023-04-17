import axios from 'axios';
import Web3 from 'web3';
import { chainRpcs, getVaultsForChain } from './common/config';

const explorerApiUrls = {
  cronos: 'api.cronoscan.com/api',
  bsc: 'api.bscscan.com/api',
  polygon: 'api.polygonscan.com/api',
  fantom: 'api.ftmscan.com/api',
  heco: 'api.hecoinfo.com/api',
  avax: 'api.snowtrace.io/api',
  moonbeam: 'api-moonbeam.moonscan.io/api',
  celo: 'api.celoscan.io/api',
  moonriver: 'api-moonriver.moonscan.io/api',
  arbitrum: 'api.arbiscan.io/api',
  aurora: 'explorer.mainnet.aurora.dev/api',
  metis: 'andromeda-explorer.metis.io/api',
  one: 'explorer.harmony.one/',
  fuse: 'explorer.fuse.io/api',
  emerald: 'explorer.emerald.oasis.dev/api',
  optimism: 'api-optimistic.etherscan.io/api',
  kava: 'explorer.kava.io/api',
  ethereum: 'api.etherscan.io/api',
  canto: 'tuber.build/api',
};

const blockScoutChains = new Set(['fuse', 'metis', 'emerald', 'aurora', 'kava', 'canto']);
const harmonyRpcChains = new Set(['one']);

const getCreationTimestamp = async (vaultAddress, explorerUrl, chain) => {
  var url =
    `https://${explorerUrl}?module=account&action=txlist&address=${vaultAddress}` +
    `&startblock=1&endblock=99999999&page=1&sort=asc&limit=1${
      !blockScoutChains.has(chain) ? '&offset=1' : ''
    }`;
  const resp = await axios.get(url);

  const block = resp.data.result[0].blockNumber;
  const timestamp = resp.data.result[0].timeStamp;

  console.log(`Creation block: ${block} - timestamp: ${timestamp}`);
  return timestamp;
};

const getCreationTimestampHarmonyRpc = async (vaultAddress, chain) => {
  const url = chainRpcs[chain];
  const resp = await axios.post(url, {
    jsonrpc: '2.0',
    method: 'hmyv2_getTransactionsHistory',
    params: [
      {
        address: vaultAddress,
        pageIndex: 0,
        pageSize: 1,
        fullTx: true,
        txType: 'ALL',
        order: 'ASC',
      },
    ],
    id: 1,
  });

  if (
    !resp.data ||
    resp.data.id !== 1 ||
    !resp.data.result ||
    !resp.data.result.transactions ||
    resp.data.result.transactions.length !== 1
  ) {
    console.dir(resp.data, { depth: null });
    throw new Error('Malformed response');
  }

  const tx0 = resp.data.result.transactions[0];
  return tx0.timestamp;
};

const getTimestamp = async (vaultAddress, chain) => {
  if (harmonyRpcChains.has(chain)) {
    console.log('Using Harmony RPC method for this chain');
    return await getCreationTimestampHarmonyRpc(vaultAddress, chain);
  } else {
    return await getCreationTimestamp(vaultAddress, explorerApiUrls[chain], chain);
  }
};

async function getContractDate(chain: string, address: string) {
  const explorer = explorerApiUrls[chain];
  if (!explorer) return console.log(`No explorer api url found for chain ${chain}`);

  const ts = await getTimestamp(address, chain);
  console.log(ts);
}

const getPoolDate = async () => {
  const poolId = process.argv[2];
  const chain = process.argv[3];

  let address = poolId;

  if (!address.startsWith('0x')) {
    let pool;
    try {
      const pools = await getVaultsForChain(chain);
      pool = pools.filter(p => p.id === poolId)[0];
    } catch (err) {
      return console.log(`${poolId} not found in pools for chain ${chain}`);
    }
    address = pool.earnContractAddress;
  }

  await getContractDate(chain, address);
};

if (process.argv.length === 4) {
  getPoolDate().catch(console.error);
} else {
  console.error(
    'Usage: yarn creationdate <vaultId|address> <chain>\ne.g. yarn creationdate one-bifi-maxi one'
  );
}
