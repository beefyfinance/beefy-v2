import BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain.ts';
import { API_URL } from '../beefy/beefy-api.ts';
import type { AxelarEstimateGasFeeResponse, IAxelarApi } from './axelar-api-types.ts';
import { getJson } from '../../../../helpers/http/http.ts';

export class AxelarApi implements IAxelarApi {
  async estimateGasFee(
    sourceChain: ChainEntity,
    destinationChain: ChainEntity
  ): Promise<BigNumber> {
    const response = await getJson<AxelarEstimateGasFeeResponse>({
      url: `${API_URL}/beefy-bridge/axelar/${sourceChain.id}/${destinationChain.id}`,
      timeout: 30_000,
    });

    const totalFee = new BigNumber(response.totalFee);
    if (!totalFee.isFinite() || totalFee.lte(0)) {
      throw new Error(`Invalid axelar fee for ${sourceChain.id}->${destinationChain.id}`);
    }

    return totalFee;
  }
}
