import _BeefyV2AppMulticallUserAbi from '../../../../config/abi/BeefyV2AppMulticall.json';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { chunk } from 'lodash';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../entities/token';
import { FetchAllAllowanceResult, IAllowanceApi } from './allowance-types';
import { selectTokenByAddress } from '../../selectors/tokens';
import { featureFlag_getAllowanceApiChunkSize } from '../../utils/feature-flags';
import { BeefyState } from '../../../../redux-types';
import { selectVaultById } from '../../selectors/vaults';

// fix ts types
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

export class AllowanceAPI<T extends ChainEntity> implements IAllowanceApi {
  constructor(protected web3: Web3, protected chain: T) {}

  public async fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult> {
    const mc = new this.web3.eth.Contract(
      BeefyV2AppMulticallUserAbi,
      this.chain.appMulticallContractAddress
    );

    // first, build a list of tokens and spenders we want info on
    const allowanceCallsByToken: {
      [tokenAddress: string]: { tokenAddress: TokenEntity['address']; spenders: Set<string> };
    } = {};
    const tokensByAddress: { [tokenAddress: TokenEntity['address']]: TokenEntity } = {};
    const addTokenAddressesToCalls = (tokenAddress: string, spenderAddress: string) => {
      const token = selectTokenByAddress(state, this.chain.id, tokenAddress);
      const keyTokenAddress = token.address.toLowerCase();
      if (!isTokenErc20(token)) {
        throw new Error(`Can't query allowance of non erc20 token, skipping ${token.id}`);
      }
      if (allowanceCallsByToken[keyTokenAddress] === undefined) {
        allowanceCallsByToken[keyTokenAddress] = {
          tokenAddress: token.address,
          spenders: new Set(),
        };
      }
      allowanceCallsByToken[keyTokenAddress].spenders.add(spenderAddress);
      // keep a map to get decimals at the end
      if (tokensByAddress[keyTokenAddress] === undefined) {
        tokensByAddress[keyTokenAddress] = token;
      }
    };

    for (const standardVault of standardVaults) {
      addTokenAddressesToCalls(standardVault.earnedTokenAddress, standardVault.earnContractAddress);
      addTokenAddressesToCalls(
        standardVault.depositTokenAddress,
        standardVault.earnContractAddress
      );
    }
    for (const govVault of govVaults) {
      addTokenAddressesToCalls(govVault.depositTokenAddress, govVault.earnContractAddress);
    }
    for (const boost of boosts) {
      const vault = selectVaultById(state, boost.vaultId);
      addTokenAddressesToCalls(vault.earnedTokenAddress, boost.earnContractAddress);
    }

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getAllowanceApiChunkSize();

    const allowanceCalls = Object.entries(allowanceCallsByToken);
    const callBatches = chunk(allowanceCalls, CHUNK_SIZE);

    const allowancePromises = callBatches.map(callBatch =>
      mc.methods
        .getAllowancesFlat(
          callBatch.map(([tokenAddress, _]) => tokenAddress),
          callBatch.map(([_, spendersCalls]) => Array.from(spendersCalls.spenders)),
          walletAddress
        )
        .call()
    );

    const results = (await Promise.all([...allowancePromises])) as AllValuesAsString<string[][]>;

    // now reasign results
    const res: FetchAllAllowanceResult = [];

    let resultsIdx = 0;

    for (const callBatch of callBatches) {
      const batchResults = results[resultsIdx];
      let resIdx = 0;
      for (const spendersCalls of callBatch.map(c => c[1])) {
        for (const spenderAddress of Array.from(spendersCalls.spenders)) {
          const allowance = batchResults[resIdx];
          if (allowance !== '0') {
            res.push({
              tokenAddress: spendersCalls.tokenAddress,
              spenderAddress,
              allowance: new BigNumber(allowance).shiftedBy(
                -tokensByAddress[spendersCalls.tokenAddress.toLowerCase()].decimals
              ),
            });
          }
          resIdx++;
        }
      }
      resultsIdx++;
    }

    return res;
  }

  async fetchTokensAllowance(
    state: BeefyState,
    tokens: TokenErc20[],
    walletAddress: string,
    spenderAddress: string
  ) {
    const mc = new this.web3.eth.Contract(
      BeefyV2AppMulticallUserAbi,
      this.chain.appMulticallContractAddress
    );

    // first, build a list of tokens and spenders we want info on
    const allowanceCallsByToken: {
      [tokenAddress: string]: { tokenAddress: TokenEntity['address']; spenders: Set<string> };
    } = {};
    const tokensByAddress: { [tokenAddress: TokenEntity['address']]: TokenEntity } = {};
    const addTokenAddressesToCalls = (tokenAddress: string, spenderAddress: string) => {
      const token = selectTokenByAddress(state, this.chain.id, tokenAddress);
      const keyTokenAddress = token.address.toLowerCase();
      if (!isTokenErc20(token)) {
        throw new Error(`Can't query allowance of non erc20 token, skipping ${token.id}`);
      }
      if (allowanceCallsByToken[keyTokenAddress] === undefined) {
        allowanceCallsByToken[keyTokenAddress] = {
          tokenAddress: token.address,
          spenders: new Set(),
        };
      }
      allowanceCallsByToken[keyTokenAddress].spenders.add(spenderAddress);
      // keep a map to get decimals at the end
      if (tokensByAddress[keyTokenAddress] === undefined) {
        tokensByAddress[keyTokenAddress] = token;
      }
    };

    for (const token of tokens) {
      addTokenAddressesToCalls(token.address, spenderAddress);
    }

    // if we send too much in a single call, we get "execution reversed"
    const CHUNK_SIZE = featureFlag_getAllowanceApiChunkSize();

    const allowanceCalls = Object.entries(allowanceCallsByToken);
    const callBatches = chunk(allowanceCalls, CHUNK_SIZE);

    const allowancePromises = callBatches.map(callBatch =>
      mc.methods
        .getAllowancesFlat(
          callBatch.map(([tokenAddress, _]) => tokenAddress),
          callBatch.map(([_, spendersCalls]) => Array.from(spendersCalls.spenders)),
          walletAddress
        )
        .call()
    );

    const results = (await Promise.all([...allowancePromises])) as AllValuesAsString<string[][]>;

    const res: FetchAllAllowanceResult = [];

    let resultsIdx = 0;

    for (const callBatch of callBatches) {
      const batchResults = results[resultsIdx];
      let resIdx = 0;
      for (const spendersCalls of callBatch.map(c => c[1])) {
        for (const spenderAddress of Array.from(spendersCalls.spenders)) {
          const allowance = batchResults[resIdx];
          if (allowance !== '0') {
            res.push({
              tokenAddress: spendersCalls.tokenAddress,
              spenderAddress,
              allowance: new BigNumber(allowance).shiftedBy(
                -tokensByAddress[spendersCalls.tokenAddress.toLowerCase()].decimals
              ),
            });
          }
          resIdx++;
        }
      }
      resultsIdx++;
    }

    return res;
  }
}
