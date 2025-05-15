import { useMemo } from 'react';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectVaultHasAssetsWithRisks,
  selectVaultHasPlatformWithRisks,
} from '../../../data/selectors/risks.ts';

export const useVaultHasRisks = (
  vaultId: VaultEntity['id']
):
  | {
      vaultHasRisks: true;
      values: Record<string, string>;
      risk: string;
    }
  | {
      vaultHasRisks: false;
      values: undefined;
      risk: undefined;
    } => {
  const vaultHasPlatformWithRisks = useAppSelector(state =>
    selectVaultHasPlatformWithRisks(state, vaultId)
  );

  const vaultHasAssetsWithRisks = useAppSelector(state =>
    selectVaultHasAssetsWithRisks(state, vaultId)
  );

  return useMemo(() => {
    // handle tokens and platform risks
    if (vaultHasAssetsWithRisks.risks && vaultHasPlatformWithRisks.risks) {
      const { tokens } = vaultHasAssetsWithRisks;
      const { platform } = vaultHasPlatformWithRisks;

      if (tokens.length > 1) {
        const auxValues: Record<string, string> = { platform: platform.name };

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          auxValues[`token${i + 1}`] = token.symbol;
        }

        const token0 = tokens[0];
        const token1 = tokens[1];

        const allTokensHasSameRisk =
          token0.risks.length === token1.risks.length &&
          token0.risks.every((value, index) => value === token1.risks[index]);

        if (allTokensHasSameRisk && token0.risks[0] === platform.risks[0]) {
          return {
            vaultHasRisks: true,
            values: auxValues,
            risk: `PLATFORM_TOKENS_${platform.risks[0]}`,
          };
        } else {
          //TODO: Add logic to handle if platform and token issues are different
          console.error(
            `Different risks for platform and tokens: ${platform.risks[0]} and ${token0.risks[0]}`
          );
          // FIXME currently on shows the platform risk if token and platform risk are different
          return {
            vaultHasRisks: true,
            values: { platform: platform.name },
            risk: `PLATFORM_${platform.risks[0]}`,
          };
        }
      } else {
        const token = tokens[0];
        return {
          vaultHasRisks: true,
          values: { platform: platform.name, token: token.symbol },
          risk: 'PLATFORM_TOKEN_NO_TIMELOCK',
        };
      }
    }
    // handle only platform risk
    else if (vaultHasPlatformWithRisks.risks) {
      // TODO handle multiple platform risks
      const { platform } = vaultHasPlatformWithRisks;
      return {
        vaultHasRisks: true,
        values: { platform: platform.name },
        risk: `PLATFORM_${platform.risks[0]}`,
      };
    }
    // handle only tokens risk
    else if (vaultHasAssetsWithRisks.risks) {
      const { tokens } = vaultHasAssetsWithRisks;
      // TODO handle different risks per token and multiple risks per token
      if (tokens.length > 1) {
        const auxValues: Record<string, string> = {};

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          auxValues[`token${i + 1}`] = token.symbol;
        }

        return { vaultHasRisks: true, values: auxValues, risk: `TOKEN_${tokens[0].risks[0]}` };
      } else {
        return {
          vaultHasRisks: true,
          values: { token: tokens[0].symbol },
          risk: `TOKEN_${tokens[0].risks[0]}`,
        };
      }
    }

    return { vaultHasRisks: false, values: undefined, risk: undefined };
  }, [vaultHasAssetsWithRisks, vaultHasPlatformWithRisks]);
};
