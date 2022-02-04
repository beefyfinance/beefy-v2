import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as _Web3Contract from 'web3-eth-contract';
import { Contract } from 'web3-eth-contract';
import _vaultAbi from '../../../../../config/abi/vault.json';
import _boostAbi from '../../../../../config/abi/boost.json';
import { sample } from 'lodash';
import { WorkerChainEntity } from '../contract-data-types';

// fix TS typings
const vaultAbi = _vaultAbi as AbiItem[];
const boostAbi = _boostAbi as AbiItem[];
const Web3Contract = _Web3Contract as any as Contract;

export function getWeb3Instance(chain: WorkerChainEntity) {
  // pick one RPC endpoint at random
  // todo: not the smartest thing to do but good enough yet
  const rpc = sample(chain.rpc);
  console.debug(`Instanciating Web3 for chain ${chain.id}`);
  return new Web3(rpc);
}

// turns out instanciating contracts is CPU heavy
// so we instanciate them only once and clone them
const baseContractCache: { vault: Contract | null; boost: Contract | null } = {
  boost: null,
  vault: null,
};
export function getVaultContractInstance(address: string) {
  if (baseContractCache.vault === null) {
    // @ts-ignore types of 'web3-eth-contract' are badly defined
    baseContractCache.vault = new Web3Contract(vaultAbi);
  }
  const vaultContract = baseContractCache.vault.clone();
  vaultContract.options.address = address;
  return vaultContract;
}

export function getBoostContractInstance(address: string) {
  if (baseContractCache.boost === null) {
    // @ts-ignore types of 'web3-eth-contract' are badly defined
    baseContractCache.boost = new Web3Contract(boostAbi);
  }
  const boostContract = baseContractCache.boost.clone();
  boostContract.options.address = address;
  return boostContract;
}
