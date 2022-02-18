import _BeefyV2AppMulticallUserAbi from '../../../../config/abi/BeefyV2AppUserMulticall.json';
import _erc20Abi from '../../../../config/abi/erc20.json';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { chunk } from 'lodash';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../entities/token';
import { FetchAllAllowanceResult, IAllowanceApi, TokenAllowance } from './allowance-types';
import { selectTokenById } from '../../selectors/tokens';
import { featureFlag_getAllowanceApiChunkSize } from '../../utils/feature-flags';
import { BeefyState } from '../../../../redux-types';
import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { createIdMap } from '../../utils/array-utils';

// fix ts types
const erc20Abi = _erc20Abi as AbiItem[];
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

export class AllowanceMcV2API<T extends ChainEntity & { fetchBalancesAddress: string }>
  implements IAllowanceApi
{
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
      this.chain.fetchBalancesAddress
    );

    // first, build a list of tokens and spenders we want info on
    const allowanceCallsByToken: {
      [tokenAddress: string]: { tokenId: TokenEntity['id']; spenders: Set<string> };
    } = {};
    const tokensById: { [tokenId: TokenEntity['id']]: TokenEntity } = {};
    const addTokenIdToCalls = (tokenId: string, spenderAddress: string) => {
      const token = selectTokenById(state, this.chain.id, tokenId);
      if (!isTokenErc20(token)) {
        throw new Error(`Can't query allowance of non erc20 token, skipping ${token.id}`);
      }
      if (allowanceCallsByToken[token.contractAddress] === undefined) {
        allowanceCallsByToken[token.contractAddress] = { tokenId: token.id, spenders: new Set() };
      }
      allowanceCallsByToken[token.contractAddress].spenders.add(spenderAddress);
      // keep a map to get decimals at the end
      if (tokensById[token.id] === undefined) {
        tokensById[token.id] = token;
      }
    };

    for (const standardVault of standardVaults) {
      addTokenIdToCalls(standardVault.earnedTokenId, standardVault.contractAddress);
      addTokenIdToCalls(standardVault.oracleId, standardVault.contractAddress);
    }
    for (const govVault of govVaults) {
      addTokenIdToCalls(govVault.oracleId, govVault.earnContractAddress);
    }
    for (const boost of boosts) {
      addTokenIdToCalls(boost.earnedTokenId, boost.earnContractAddress);
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
              tokenId: spendersCalls.tokenId,
              spenderAddress,
              allowance: new BigNumber(allowance).shiftedBy(
                -tokensById[spendersCalls.tokenId].decimals
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

  async fetchTokensAllowance(tokens: TokenErc20[], walletAddress: string, spenderAddress: string) {
    const calls: ShapeWithLabel[] = [];
    const baseTokenContract = new this.web3.eth.Contract(erc20Abi);

    for (const token of tokens) {
      const tokenContract = baseTokenContract.clone();
      tokenContract.options.address = token.contractAddress;
      calls.push({
        tokenId: token.id,
        spenderAddress: spenderAddress,
        tokenAddress: token.contractAddress,
        allowance: tokenContract.methods.allowance(walletAddress, spenderAddress),
      });
    }

    type ResultType = AllValuesAsString<TokenAllowance>;
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const [results] = (await mc.all([calls])) as ResultType[][];

    const tokensById = createIdMap(tokens);

    return results.map(
      (result): TokenAllowance => ({
        tokenId: result.tokenId,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance).shiftedBy(-tokensById[result.tokenId].decimals),
      })
    );
  }
}
