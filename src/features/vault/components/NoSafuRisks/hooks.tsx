import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../../store';
import type { VaultEntity } from '../../../data/entities/vault';
import {
  selectVaultHasAssetsWithRisks,
  selectVaultHasPlatformWithRisks,
} from '../../../data/selectors/vaults';

export const useVaultHasRisks = (vaultId: VaultEntity['id']) => {
  const [vaultHasRisks, setVaultHasRisks] = useState<boolean>(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [risk, setRisk] = useState<string>('');

  const vaultHasPlatformWithRisks = useAppSelector(state =>
    selectVaultHasPlatformWithRisks(state, vaultId)
  );

  const vaultHasAssetsWithRisks = useAppSelector(state =>
    selectVaultHasAssetsWithRisks(state, vaultId)
  );

  useEffect(() => {
    const { platform } = vaultHasPlatformWithRisks;
    const { tokens } = vaultHasAssetsWithRisks;

    //handle tokens and platform risks
    if (vaultHasAssetsWithRisks.risks && vaultHasPlatformWithRisks.risks) {
      console.log('hi');
      if (tokens.length > 1) {
        const auxValues = { platform: platform.name };

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          auxValues[`token${i + 1}`] = token.symbol;
        }

        setValues(auxValues);

        const token0 = tokens[0];
        const token1 = tokens[1];

        const allTokensHasSameIssue =
          token0.risks.length === token1.risks.length &&
          token0.risks.every((value, index) => value === token1.risks[index]);

        if (allTokensHasSameIssue && token0.risks[0] === platform.risks[0]) {
          setRisk(`PLATFORM_TOKENS_${platform.risks[0]}`);
        }
        //TODO: Add logic to handle if platform and token issues are differents
      } else {
        const token = tokens[0];
        setValues({ platform: platform.name, token: token.symbol });

        setRisk('PLATFORM_TOKEN_NO_TIMELOCK');
      }

      setVaultHasRisks(true);
    }
    //handle only platform risk
    else if (vaultHasPlatformWithRisks.risks) {
      setValues({ platform: platform.name });
      setRisk(`PLATFORM_NO_TIMELOCK`);
      setVaultHasRisks(true);
    }
    //handle only tokens risk
    else if (vaultHasAssetsWithRisks.risks) {
      if (tokens.length > 1) {
        const auxValues = {};

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          auxValues[`token${i + 1}`] = token.symbol;
        }

        setValues(auxValues);
        setRisk(`TOKENS_NO_TIMELOCK`);
      } else {
        setValues({ token: tokens[0].symbol });
        setRisk(`TOKEN_${tokens[0].risks[0]}`);
      }

      setVaultHasRisks(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { vaultHasRisks, values, risk };
};
