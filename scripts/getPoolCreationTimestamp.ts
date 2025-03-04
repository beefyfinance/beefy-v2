import {
  type AddressBookChainId,
  appToAddressBookId,
  type ChainMap,
  getChainRpc,
  getVaultsForChain,
} from './common/config.ts';

const explorerApiUrls: ChainMap<string> = {
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
  base: 'api.basescan.org/api',
};

const blockScoutChains = new Set<AddressBookChainId>([
  'fuse',
  'metis',
  'emerald',
  'aurora',
  'kava',
  'canto',
]);
const harmonyRpcChains = new Set<AddressBookChainId>(['one']);

const getCreationTimestamp = async (
  vaultAddress: string,
  explorerUrl: string,
  chain: AddressBookChainId
) => {
  const url =
    `https://${explorerUrl}?module=account&action=txlist&address=${vaultAddress}` +
    `&startblock=1&endblock=99999999&page=1&sort=asc&limit=1${
      !blockScoutChains.has(chain) ? '&offset=1' : ''
    }`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as {
    status: string;
    message: string;
    data: { result: Array<{ blockNumber: string; timeStamp: string }> };
  };

  const block = data.data.result[0].blockNumber;
  const timestamp = data.data.result[0].timeStamp;

  console.log(`Creation block: ${block} - timestamp: ${timestamp}`);
  return timestamp;
};

const getCreationTimestampHarmonyRpc = async (vaultAddress: string, chain: AddressBookChainId) => {
  const url = getChainRpc(chain);

  const resp = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
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
    }),
  });

  if (!resp.ok) {
    throw new Error('Malformed response');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await resp.json();

  if (
    !data ||
    data.id !== 1 ||
    !data.result ||
    !data.result.transactions ||
    data.result.transactions.length !== 1
  ) {
    console.dir(resp, { depth: null });
    throw new Error('Malformed response');
  }

  const tx0 = data.result.transactions[0];
  return tx0.timestamp as string;
};

const getTimestamp = async (vaultAddress: string, chain: AddressBookChainId) => {
  if (harmonyRpcChains.has(chain)) {
    console.log('Using Harmony RPC method for this chain');
    return await getCreationTimestampHarmonyRpc(vaultAddress, chain);
  } else {
    const explorerApiUrl = explorerApiUrls[chain];
    if (!explorerApiUrl) {
      throw new Error(`No explorer api url found for chain ${chain}`);
    }
    return await getCreationTimestamp(vaultAddress, explorerApiUrl, chain);
  }
};

async function getContractDate(chain: AddressBookChainId, address: string) {
  const explorer = explorerApiUrls[chain];
  if (!explorer) return console.log(`No explorer api url found for chain ${chain}`);

  const ts = await getTimestamp(address, chain);
  console.log(ts);
}

const getPoolDate = async () => {
  const poolId = process.argv[2];
  const chain = appToAddressBookId(process.argv[3]);

  let address = poolId;

  if (!address.startsWith('0x')) {
    let pool;
    try {
      const pools = await getVaultsForChain(chain);
      pool = pools.filter(p => p.id === poolId)[0];
    } catch (err) {
      return console.log(`${poolId} not found in pools for chain ${chain}`, err);
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
