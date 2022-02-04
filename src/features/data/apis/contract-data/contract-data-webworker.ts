import * as Comlink from 'comlink';

import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { BoostEntity } from '../../entities/boost';
import { selectTokenById } from '../../selectors/tokens';
import { isTokenErc20 } from '../../entities/token';
import {
  BoostContractData,
  FetchAllContractDataWorkerResults,
  FetchAllContractDataResult,
  GovVaultContractData,
  IContractDataApi,
  StandardVaultContractData,
} from './contract-data-types';
import { BeefyState } from '../../../../redux-types';

/**
 * Get vault contract data
 */
export class ContractDataInWebWorkerAPI implements IContractDataApi {
  constructor(protected chain: ChainEntity, protected worker: Comlink.Remote<Worker>) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllContractDataResult> {
    // pass as little data as possible to the web worker
    const workerParams /*: FetchAllContractDataWorkerParams*/ = {
      chain: this.chain,
      boosts: boosts.map(boost => ({ id: boost.id, contractAddress: boost.earnContractAddress })),
      govVaults: govVaults.map(vault => ({
        id: vault.id,
        contractAddress: vault.earnContractAddress,
      })),
      standardVaults: standardVaults.map(vault => {
        const earnedToken = selectTokenById(state, this.chain.id, vault.earnedTokenId);
        // do this check to please the TypeScript gods
        if (!isTokenErc20(earnedToken)) {
          console.info(
            `VaultContractAPI.fetchStandardVaultsContractData: skipping non erc20 token ${earnedToken.id}`
          );
          return null;
        }
        return { id: vault.id, contractAddress: earnedToken.contractAddress };
      }),
    };

    // @ts-ignore
    const strRes: FetchAllContractDataWorkerResults = await this.worker.fetchAllContractData(
      workerParams
    );

    // format string results
    const res: FetchAllContractDataResult = {
      boosts: strRes.boosts.map(result => {
        return {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply),
          rewardRate: new BigNumber(result.rewardRate),
          periodFinish: parseInt(result.periodFinish),
        } as BoostContractData;
      }),
      govVaults: strRes.govVaults.map(result => {
        return {
          id: result.id,
          totalSupply: new BigNumber(result.totalSupply),
        } as GovVaultContractData;
      }),
      standardVaults: strRes.standardVaults.map(result => {
        return {
          id: result.id,
          balance: new BigNumber(result.balance),
          pricePerFullShare: new BigNumber(result.pricePerFullShare),
          strategy: result.strategy,
        } as StandardVaultContractData;
      }),
    };
    return res;
  }
}
