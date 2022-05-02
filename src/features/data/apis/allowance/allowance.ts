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
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../selectors/tokens';
import { FetchAllAllowanceResult, IAllowanceApi, TokenAllowance } from './allowance-types';
import { BeefyState } from '../../../../redux-types';
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
      [tokenAddress: string]: { tokenAddress: TokenEntity['id']; spenders: Set<string> };
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
      addTokenAddressesToCalls(standardVault.tokenAddress, standardVault.earnContractAddress);
      // special case for what seem to be a maxi vault
      const earnToken = selectErc20TokenByAddress(
        state,
        this.chain.id,
        standardVault.earnedTokenAddress
      );
      addTokenAddressesToCalls(standardVault.tokenAddress, earnToken.address);
    }
    for (const govVault of govVaults) {
      addTokenAddressesToCalls(govVault.tokenAddress, govVault.earnContractAddress);
    }
    for (const boost of boosts) {
      const vault = selectVaultById(state, boost.vaultId);
      addTokenAddressesToCalls(vault.earnedTokenAddress, boost.earnContractAddress);
    }

    const calls: ShapeWithLabel[] = [];
    const baseTokenContract = new this.web3.eth.Contract(erc20Abi);
    for (const [tokenAddress, spendersCalls] of Object.entries(allowanceCallsByToken)) {
      const tokenContract = baseTokenContract.clone();
      tokenContract.options.address = tokenAddress;
      for (const spender of Array.from(spendersCalls.spenders)) {
        calls.push({
          tokenAddress: spendersCalls.tokenAddress, // not sure about this
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
        tokenAddress: result.tokenAddress,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance).shiftedBy(
          -tokensByAddress[result.tokenAddress.toLowerCase()].decimals
        ),
      })
    );
  }

  async fetchTokensAllowance(tokens: TokenErc20[], walletAddress: string, spenderAddress: string) {
    const calls: ShapeWithLabel[] = [];
    const baseTokenContract = new this.web3.eth.Contract(erc20Abi);

    for (const token of tokens) {
      const tokenContract = baseTokenContract.clone();
      tokenContract.options.address = token.address;
      calls.push({
        tokenId: token.id,
        spenderAddress: spenderAddress,
        tokenAddress: token.address,
        allowance: tokenContract.methods.allowance(walletAddress, spenderAddress),
      });
    }

    type ResultType = AllValuesAsString<TokenAllowance>;
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const [results] = (await mc.all([calls])) as ResultType[][];

    const tokensByAddress = tokens.reduce((agg, item) => {
      agg[item.address.toLowerCase()] = item;
      return agg;
    }, {});

    return results.map(
      (result): TokenAllowance => ({
        tokenAddress: result.tokenAddress,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance).shiftedBy(
          -tokensByAddress[result.tokenAddress.toLowerCase()].decimals
        ),
      })
    );
  }
}
