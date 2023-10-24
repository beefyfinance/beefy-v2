import Web3 from 'web3';
import type { Contract } from 'web3-eth-contract';
import ContractConstructor from 'web3-eth-contract';
import type { AbiItem } from 'web3-utils';
import utils from 'web3-utils';
import { formatters } from 'web3-core-helpers';
import type { Transaction, provider } from 'web3-core';
import BigNumber from 'bignumber.js';
import { maybeHexToNumber } from './format';
import type { Method } from 'web3-core-method';
import type PQueue from 'p-queue';

export type Web3CallMethod = {
  request: (params: unknown, callback: (err: Error, data: unknown) => void) => Method;
};

export interface Web3Call {
  method: Web3CallMethod;
  params: unknown;
}

type RawBlockResult = {
  number: string;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: string[];
  uncles: string[];
  baseFeePerGas?: string;
};
export type BeefyBlock = {
  number: BigNumber;
  difficulty: BigNumber;
  extraData: string;
  gasLimit: BigNumber;
  gasUsed: BigNumber;
  hash: string;
  logsBloom: string;
  miner: string;
  mixHash: string;
  nonce: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: BigNumber;
  stateRoot: string;
  timestamp: BigNumber;
  totalDifficulty: BigNumber;
  uncles: string[];
};
export type BeefyBlockWithTransactions = BeefyBlock & { transactions: Transaction[] };

type RawFeeHistoryResult = {
  baseFeePerGas: string[];
  gasUsedRatio: number[];
  oldestBlock: string;
  reward: string[][];
};
export type BeefyFeeHistory = {
  baseFeePerGas: BigNumber[];
  gasUsedRatio: number[];
  oldestBlock: BigNumber;
  reward: BigNumber[][];
};

declare module 'web3-eth' {
  export interface Eth {
    getBeefyBlock: (
      blockNumber: string | number,
      returnTransactionObjects?: boolean
    ) => Promise<BeefyBlock | BeefyBlockWithTransactions>;
    getBeefyFeeHistory: (
      blockCount: number,
      newestBlock: string | number,
      rewardPercentiles: number[]
    ) => Promise<BeefyFeeHistory>;

    getBeefyGasPrice(): Promise<BigNumber>;

    getBeefyMaxPriorityFeePerGas(): Promise<BigNumber>;
  }
}

export function makeBatchRequest(web3: Web3, calls: Web3Call[]): Promise<unknown[]> {
  const batch = new web3.BatchRequest();

  const promises = calls.map(call => {
    return new Promise((res, rej) => {
      const req = call.method.request(call.params, (err, data) => {
        if (err) rej(err);
        else res(data);
      });
      batch.add(req);
    });
  });
  batch.execute();

  return Promise.all(promises);
}

function inputBooleanFormatter(value: unknown): boolean {
  return !!value;
}

function beefyBigNumberFormatter(value: string): BigNumber {
  return new BigNumber(value);
}

function beefyBlockFormatter(block: RawBlockResult): BeefyBlock | BeefyBlockWithTransactions {
  return {
    number: new BigNumber(block.number),
    difficulty: new BigNumber(block.difficulty),
    extraData: block.extraData,
    gasLimit: new BigNumber(block.gasLimit),
    gasUsed: new BigNumber(block.gasUsed),
    hash: block.hash,
    logsBloom: block.logsBloom,
    miner: utils.toChecksumAddress(block.miner),
    mixHash: block.mixHash,
    nonce: block.nonce,
    parentHash: block.parentHash,
    receiptsRoot: block.receiptsRoot,
    sha3Uncles: block.sha3Uncles,
    size: new BigNumber(block.size),
    stateRoot: block.stateRoot,
    timestamp: new BigNumber(block.timestamp),
    totalDifficulty: new BigNumber(block.totalDifficulty),
    uncles: block.uncles,
    ...(block.transactions && {
      transactions: block.transactions.map(txHashOrObj =>
        typeof txHashOrObj === 'string'
          ? txHashOrObj
          : formatters.outputTransactionFormatter(txHashOrObj)
      ),
    }),
    ...(block.baseFeePerGas && { baseFeePerGas: new BigNumber(block.baseFeePerGas) }),
  };
}

function beefyFeeHistoryResultFormatter(feeHistory: RawFeeHistoryResult): BeefyFeeHistory {
  return {
    baseFeePerGas: feeHistory.baseFeePerGas.map(baseFee => new BigNumber(baseFee)),
    gasUsedRatio: feeHistory.gasUsedRatio,
    oldestBlock: new BigNumber(feeHistory.oldestBlock),
    reward: feeHistory.reward.map(rewards => rewards.map(reward => new BigNumber(reward))),
  };
}

type Web3DummyFormatter = () => void;
type Web3DummyInputFormatter = Web3DummyFormatter[];
type Web3DummyOutputFormatter = Web3DummyFormatter;

/**
 * Creates a new Web3 instance with our custom methods
 * @param rpc
 */
export function createWeb3Instance(rpc: provider): Web3 {
  const instance = new Web3(rpc);

  instance.eth.extend({
    methods: [
      {
        name: 'getChainId',
        call: 'eth_chainId',
        outputFormatter: maybeHexToNumber as unknown as Web3DummyOutputFormatter,
      },
      {
        name: 'getBeefyBlock',
        call: 'eth_getBlockByNumber',
        params: 2,
        inputFormatter: [
          formatters.inputBlockNumberFormatter,
          inputBooleanFormatter,
        ] as unknown as Web3DummyInputFormatter,
        outputFormatter: beefyBlockFormatter as unknown as Web3DummyOutputFormatter,
      },
      {
        name: 'getBeefyFeeHistory',
        call: 'eth_feeHistory',
        params: 3,
        inputFormatter: [
          utils.numberToHex,
          formatters.inputBlockNumberFormatter,
          null,
        ] as unknown as Web3DummyInputFormatter,
        outputFormatter: beefyFeeHistoryResultFormatter as unknown as Web3DummyOutputFormatter,
      },
      {
        name: 'getBeefyMaxPriorityFeePerGas',
        call: 'eth_maxPriorityFeePerGas',
        params: 0,
        outputFormatter: beefyBigNumberFormatter as unknown as Web3DummyOutputFormatter,
      },
      {
        name: 'getBeefyGasPrice',
        call: 'eth_gasPrice',
        params: 0,
        outputFormatter: beefyBigNumberFormatter as unknown as Web3DummyOutputFormatter,
      },
    ],
  });

  return instance;
}

type PrivateWeb3 = Web3 & {
  _requestManager: {
    provider: PrivateProvider;
    setProvider: (provider: PrivateProvider, net: unknown) => unknown;
  };
};

type PrivateProvider = {
  request?: (...args: unknown[]) => Promise<unknown>;
  send?: (payload: unknown, callback: (err: unknown, data: unknown) => unknown) => void;
  sendAsync?: (payload: unknown, callback: (err: unknown, data: unknown) => unknown) => void;
};

export function rateLimitWeb3Instance(web3: Web3, queue: PQueue): Web3 {
  const privateWeb3 = web3 as PrivateWeb3;
  const originalSetProvider = privateWeb3._requestManager.setProvider.bind(
    privateWeb3._requestManager
  );

  // rate limit future providers
  privateWeb3._requestManager.setProvider = (provider: PrivateProvider, net: unknown) => {
    return originalSetProvider(rateLimitProvider(provider, queue), net);
  };

  // rate limit this provider
  if (privateWeb3._requestManager.provider) {
    privateWeb3._requestManager.provider = rateLimitProvider(
      privateWeb3._requestManager.provider,
      queue
    );
  }

  return privateWeb3;
}

function rateLimitProvider(provider: PrivateProvider, queue: PQueue): PrivateProvider {
  // send and sendAsync are callback based
  for (const method of ['send', 'sendAsync'] as const) {
    if (provider[method]) {
      const originalMethod = provider[method].bind(provider);
      provider[method] = (payload: unknown, callback: (err: unknown, data: unknown) => unknown) => {
        return queue
          .add(
            () =>
              new Promise((resolve, reject) => {
                originalMethod(payload, (err, data) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(data);
                  }
                });
              })
          )
          .then(data => Promise.resolve(callback(null, data)))
          .catch(err => Promise.resolve(callback(err, null)))
          .catch(err => console.error('callback threw', err));
      };
    }
  }

  // Request is promise based
  if (provider.request) {
    const originalRequest = provider.request.bind(provider);
    provider.request = async (...args: unknown[]) => {
      return await queue.add(() => originalRequest(...args));
    };
  }

  return provider;
}

export function createContract(jsonInterface: AbiItem[], address: string): Contract {
  return new (ContractConstructor as unknown as typeof Contract)(jsonInterface, address);
}
