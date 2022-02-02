import _BeefyV2AppMulticallUserAbi from '../../../../config/abi/BeefyV2AppUserMulticall.json';
import { AbiItem } from 'web3-utils';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { chunk } from 'lodash';
import { isTokenErc20, TokenEntity } from '../../entities/token';
import { FetchAllAllowanceResult, IAllowanceApi } from './allowance-types';
import { BeefyState } from '../../../redux/reducers/storev2';
import { selectTokenById } from '../../selectors/tokens';

// fix ts types
const BeefyV2AppMulticallUserAbi = _BeefyV2AppMulticallUserAbi as AbiItem | AbiItem[];

export class MulticallMcV2API<T extends ChainEntity & { fetchBalancesAddress: string }>
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
    const addTokenIdToCalls = (tokenId: string, spenderAddress: string) => {
      const token = selectTokenById(state, this.chain.id, tokenId);
      if (!isTokenErc20(token)) {
        throw new Error("Can't query allowance of non erc20 token");
      }
      if (allowanceCallsByToken[token.contractAddress] === undefined) {
        allowanceCallsByToken[token.contractAddress] = { tokenId: token.id, spenders: new Set() };
      }
      allowanceCallsByToken[token.contractAddress].spenders.add(spenderAddress);
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
    const CHUNK_SIZE = 500;

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
      for (const [_, spendersCalls] of callBatch) {
        for (const spenderAddress of Array.from(spendersCalls.spenders)) {
          const allowance = batchResults[resIdx];
          if (allowance !== '0') {
            res.push({
              tokenId: spendersCalls.tokenId,
              spenderAddress,
              allowance: new BigNumber(allowance),
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
