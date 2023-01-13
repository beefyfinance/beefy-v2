import Web3 from 'web3';
import ContractConstructor, { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import utils from 'web3-utils';
import { formatters } from 'web3-core-helpers';
import { Transaction, provider } from 'web3-core';
import BigNumber from 'bignumber.js';
import { maybeHexToNumber } from './format';

export interface Web3Call {
  method: any;
  params: any;
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

export function makeBatchRequest(web3: Web3, calls: Web3Call[]): Promise<any[]> {
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

function inputBooleanFormatter(value: any): boolean {
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
        outputFormatter: maybeHexToNumber as any,
      },
      {
        name: 'getBeefyBlock',
        call: 'eth_getBlockByNumber',
        params: 2,
        inputFormatter: [formatters.inputBlockNumberFormatter, inputBooleanFormatter] as any,
        outputFormatter: beefyBlockFormatter as any,
      },
      {
        name: 'getBeefyFeeHistory',
        call: 'eth_feeHistory',
        params: 3,
        inputFormatter: [utils.numberToHex, formatters.inputBlockNumberFormatter, null] as any,
        outputFormatter: beefyFeeHistoryResultFormatter as any,
      },
      {
        name: 'getBeefyMaxPriorityFeePerGas',
        call: 'eth_maxPriorityFeePerGas',
        params: 0,
        outputFormatter: beefyBigNumberFormatter as any,
      },
      {
        name: 'getBeefyGasPrice',
        call: 'eth_gasPrice',
        params: 0,
        outputFormatter: beefyBigNumberFormatter as any,
      },
    ],
  });

  return instance;
}

export function createContract(jsonInterface: AbiItem[], address: string): Contract {
  return new (ContractConstructor as unknown as typeof Contract)(jsonInterface, address);
}
