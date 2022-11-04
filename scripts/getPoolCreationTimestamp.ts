import axios from 'axios';
import Web3 from 'web3';
import { chainRpcs, getVaultsForChain } from './config';

const explorerApiUrls = {
  cronos: 'https://api.cronoscan.com/api',
  bsc: 'https://api.bscscan.com/api',
  polygon: 'https://api.polygonscan.com/api',
  fantom: 'https://api.ftmscan.com/api',
  heco: 'https://api.hecoinfo.com/api',
  avax: 'https://api.snowtrace.io//api',
  moonbeam: 'https://api-moonbeam.moonscan.io/api',
  celo: 'https://explorer.celo.org/',
  moonriver: 'https://api-moonriver.moonscan.io/api',
  arbitrum: 'https://api.arbiscan.io/api',
  aurora: 'https://api.aurorascan.dev/api',
  metis: 'https://andromeda-explorer.metis.io/',
  one: 'https://explorer.harmony.one/',
  fuse: 'https://explorer.fuse.io/',
  emerald: 'https://explorer.emerald.oasis.dev/',
  optimism: 'https://api-optimistic.etherscan.io/api',
  kava: 'https://explorer.kava.io/',
  ethereum: 'https://api.etherscan.io/api',
};

const blockScoutChainsTimeout = new Set(['fuse', 'metis', 'celo', 'emerald', 'kava']);
const harmonyRpcChains = new Set(['one']);

const getCreationTimestamp = async (vaultAddress, explorerUrl) => {
  var url =
    explorerUrl +
    `?module=account&action=txlist&address=${vaultAddress}&startblock=1&endblock=99999999&page=1&offset=1&sort=asc&limit=1`;
  const resp = await axios.get(url);

  const block = resp.data.result[0].blockNumber;
  const timestamp = resp.data.result[0].timeStamp;

  console.log(`Creation block: ${block} - timestamp: ${timestamp}`);
  return timestamp;
};

const getCreationTimestampBlockScoutScraping = async (vaultAddress, explorerUrl, chain) => {
  var url = explorerUrl + `/address/${vaultAddress}`;

  let resp = await axios.get(url);

  let tx = resp.data.split(`<a data-test="transaction_hash_link" href="/`)[1].split(`"`)[0];

  let txResp = await axios.get(`${explorerUrl}/${tx}/internal-transactions`);

  let block = txResp.data.split(`<a class="transaction__link" href="/block/`)[1].split(`"`)[0];

  const rpc = chainRpcs[chain];
  let web3 = new Web3(rpc);
  let timestamp = (await web3.eth.getBlock(block)).timestamp;

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
  if (blockScoutChainsTimeout.has(chain)) {
    console.log('BlockScout explorer detected for this chain, proceeding to scrape');
    return await getCreationTimestampBlockScoutScraping(
      vaultAddress,
      explorerApiUrls[chain],
      chain
    );
  } else if (harmonyRpcChains.has(chain)) {
    console.log('Using Harmony RPC method for this chain');
    return await getCreationTimestampHarmonyRpc(vaultAddress, chain);
  } else {
    return await getCreationTimestamp(vaultAddress, explorerApiUrls[chain]);
  }
};

const getPoolDate = async () => {
  const poolId = process.argv[2];
  const chain = process.argv[3];

  let pool;
  try {
    const pools = await getVaultsForChain(chain);
    pool = pools.filter(p => p.id === poolId)[0];
  } catch (err) {
    return console.log(`${poolId} not found in pools for chain ${chain}`);
  }
  const address = pool.earnContractAddress;

  const explorer = explorerApiUrls[chain];
  if (!explorer) return console.log(`No explorer api url found for chain ${chain}`);

  const ts = await getTimestamp(address, chain);
  console.log(ts);
};

if (process.argv.length === 4) {
  getPoolDate().catch(console.error);
} else {
  console.error(
    'Usage: yarn creationdate <vaultId> <chain>\ne.g. yarn creationdate one-bifi-maxi one'
  );
}
