import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _vaultAbi from '../../../config/abi/vault.json';
import _boostAbi from '../../../config/abi/boost.json';
import _erc20Abi from '../../../config/abi/erc20.json';
import _multicallAbi from '../../../config/abi/multicall.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BoostEntity } from '../entities/boost';
import { isTokenBoost, isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';
import { BeefyState } from '../../redux/reducers';
import { selectTokenById } from '../selectors/tokens';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];
const erc20Abi = _erc20Abi as AbiItem[];
const multicallAbi = _multicallAbi as AbiItem[];

export interface VaultAllowance {
  vaultId: VaultEntity['id'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

export interface BoostAllowance {
  boostId: BoostEntity['id'];
  spenderAddress: string; // a 0x address
  allowance: BigNumber;
}

/**
 * Get vault contract data
 */
export class AllowanceAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  /**
   * Do we really need this?
   */
  public async fetchGovVaultPoolAllowance(
    state: BeefyState,
    vaults: VaultGov[],
    walletAddress: string
  ): Promise<VaultAllowance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const vault of vaults) {
      const token = selectTokenById(state, this.chain.id, vault.oracleId);
      if (!isTokenErc20(token)) {
        console.warn(`Token ${token.id} is not erc20, can't fetch allowance`);
        continue;
      }

      const tokenContract = new this.web3.eth.Contract(erc20Abi, token.contractAddress);
      calls.push({
        vaultId: vault.id, // not sure about this
        spenderAddress: vault.poolAddress,
        allowance: tokenContract.methods.allowance(walletAddress, vault.poolAddress),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<VaultAllowance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        vaultId: result.vaultId,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance || 0),
      } as VaultAllowance;
    });
  }

  public async fetchBoostAllowance(
    state: BeefyState,
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<BoostAllowance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const calls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      const earnedToken = selectTokenById(state, this.chain.id, boost.earnedTokenId);
      if (!isTokenErc20(earnedToken)) {
        console.warn(`Token ${earnedToken.id} is not erc20, can't fetch allowance`);
        continue;
      }

      const tokenContract = new this.web3.eth.Contract(erc20Abi, earnedToken.contractAddress);
      calls.push({
        boostId: boost.id,
        spenderAddress: boost.earnContractAddress,
        allowance: tokenContract.methods.allowance(walletAddress, boost.earnContractAddress),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostAllowance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        boostId: result.boostId,
        spenderAddress: result.spenderAddress,
        allowance: new BigNumber(result.allowance || 0),
      } as BoostAllowance;
    });
  }
}
