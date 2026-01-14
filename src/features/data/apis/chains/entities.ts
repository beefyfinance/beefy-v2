import { omit } from 'lodash-es';
import type { ChainConfig } from './config-types.ts';
import { config } from '../../../../config/config.ts';
import { freezeArray } from '../../utils/array-utils.ts';
import type { BuiltEntities, BuiltEntity } from './entity-types.ts';

function buildChainEntities<const TInput extends readonly [ChainConfig, ...ChainConfig[]]>(
  chains: TInput
) {
  return freezeArray(
    chains
      .filter(c => !c.disabled)
      .map(input => {
        return {
          ...omit(input, [
            'chainId',
            'explorerTokenUrlTemplate',
            'explorerAddressUrlTemplate',
            'explorerTxUrlTemplate',
            'viem',
          ]),
          networkChainId: input.chainId,
          explorerTokenUrlTemplate:
            input.explorerTokenUrlTemplate || `${input.explorerUrl}/token/{address}`,
          explorerAddressUrlTemplate:
            input.explorerAddressUrlTemplate || `${input.explorerUrl}/address/{address}`,
          explorerTxUrlTemplate: input.explorerTxUrlTemplate || `${input.explorerUrl}/tx/{hash}`,
          new: input.new || false,
          eol: input.eol || 0,
          brand: {
            icon: input.brand?.icon || 'solid',
            header: input.brand?.header || 'solid',
          },
        } as const satisfies BuiltEntity;
      })
  ) as BuiltEntities<TInput>;
}

export const entities = buildChainEntities(config);
