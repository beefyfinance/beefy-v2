import * as Comlink from 'comlink';

import { VaultGov, VaultStandard } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { BeefyState } from '../../../redux/reducers/storev2';
import { BoostEntity } from '../../entities/boost';
import { selectTokenById } from '../../selectors/tokens';
import { isTokenErc20 } from '../../entities/token';
import {
  BoostContractData,
  FetchAllContractDataWorkerResults,
  FetchAllResult,
  GovVaultContractData,
  StandardVaultContractData,
} from './worker/shared-worker-types';
import { sortBy } from 'lodash';

/**
 * Get vault contract data
 */
export class ContractDataAPIV2 {
  constructor(protected chain: ChainEntity, protected worker: Comlink.Remote<Worker>) {}

  public async fetchAllContractData(
    state: BeefyState,
    standardVaults: VaultStandard[],
    govVaults: VaultGov[],
    boosts: BoostEntity[]
  ): Promise<FetchAllResult> {
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
    const res: FetchAllResult = {
      boosts: strRes.boosts.map(result => {
        return {
          id: result.id,
          totalStaked: new BigNumber(result.totalStaked),
          rewardRate: new BigNumber(result.rewardRate),
          periodFinish: parseInt(result.periodFinish),
        } as BoostContractData;
      }),
      govVaults: strRes.govVaults.map(result => {
        return {
          id: result.id,
          totalStaked: new BigNumber(result.totalStaked),
        } as GovVaultContractData;
      }),
      standardVaults: strRes.standardVaults.map(result => {
        return {
          id: result.id,
          balance: new BigNumber(result.balance),
          pricePerFullShare: new BigNumber(result.balance),
          strategy: result.strategy,
        } as StandardVaultContractData;
      }),
    };

    if (!globalThis._res) {
      globalThis._res = { boosts: [], govVaults: [], standardVaults: [] };
    }
    globalThis._res.boosts = globalThis._res.boosts.concat(res.boosts);
    globalThis._res.govVaults = globalThis._res.govVaults.concat(res.govVaults);
    globalThis._res.standardVaults = globalThis._res.standardVaults.concat(res.standardVaults);
    globalThis._res.boosts = sortBy(globalThis._res.boosts, ['id']);
    globalThis._res.govVaults = sortBy(globalThis._res.govVaults, ['id']);
    globalThis._res.standardVaults = sortBy(globalThis._res.standardVaults, ['id']);
    console.log({ res });
    return res;
  }
}
