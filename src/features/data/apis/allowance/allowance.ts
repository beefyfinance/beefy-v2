import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _erc20Abi from '../../../../config/abi/erc20.json';
import Web3 from 'web3';
import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { isTokenErc20, TokenEntity, TokenErc20 } from '../../entities/token';
import { selectErc20TokenById, selectTokenById } from '../../selectors/tokens';
import { FetchAllAllowanceResult, IAllowanceApi, TokenAllowance } from './allowance-types';
import { BeefyState } from '../../../../redux-types';
import { createIdMap } from '../../utils/array-utils';
import { selectVaultById } from '../../selectors/vaults';

// fix TS typings
const erc20Abi = _erc20Abi as AbiItem[];

/**
 * Get vault contract data
 */
export class AllowanceAPI implements IAllowanceApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchAllAllowances(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllAllowanceResult> {
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
      // special case for what seem to be a maxi vault
      const earnToken = selectErc20TokenById(state, this.chain.id, standardVault.earnedTokenId);
      addTokenIdToCalls(standardVault.oracleId, earnToken.contractAddress);
    }
    for (const govVault of govVaults) {
      addTokenIdToCalls(govVault.oracleId, govVault.earnContractAddress);
    }
    for (const boost of boosts) {
      const vault = selectVaultById(state, boost.vaultId);
      addTokenIdToCalls(vault.earnedTokenId, boost.earnContractAddress);
    }

    const calls: ShapeWithLabel[] = [];
    const baseTokenContract = new this.web3.eth.Contract(erc20Abi);
    for (const [tokenAddress, spendersCalls] of Object.entries(allowanceCallsByToken)) {
      const tokenContract = baseTokenContract.clone();
      tokenContract.options.address = tokenAddress;
      for (const spender of Array.from(spendersCalls.spenders)) {
        calls.push({
          tokenId: spendersCalls.tokenId, // not sure about this
          spenderAddress: spender,
          allowance: tokenContract.methods.allowance(walletAddress, spender),
        });
      }
    }

    type ResultType = AllValuesAsString<TokenAllowance>;
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const [results] = (await mc.all([calls])) as ResultType[][];

    return results.map(
      (result): TokenAllowance => ({
        tokenId: result.tokenId,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance).shiftedBy(-tokensById[result.tokenId].decimals),
      })
    );
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
