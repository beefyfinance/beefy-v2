import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { type VaultEntity, type VaultGov } from '../../../../data/entities/vault';
import { type CommonHelper, isGovCommonHelper, useCommonHelper } from './common';
import { selectGovVaultEarnedTokens } from '../../../../data/selectors/tokens';
import { useAppSelector } from '../../../../../store';
import type { TokenEntity } from '../../../../data/entities/token';

type GovHelper = CommonHelper<VaultGov> & {
  earnedTokens: TokenEntity[];
};

function useGovHelper(vaultId: VaultEntity['id']): GovHelper {
  const helper = useCommonHelper(vaultId);
  if (!isGovCommonHelper(helper)) {
    throw new Error('This hook is only for gov vaults');
  }

  const earnedTokens = useAppSelector(state =>
    selectGovVaultEarnedTokens(state, helper.vault.chainId, helper.vault.id)
  );
  return useMemo(() => {
    const newValues = {
      earnedToken: earnedTokens[0].symbol,
    };
    for (const i in earnedTokens) {
      newValues[`earnedToken${i}`] = earnedTokens[i].symbol;
    }

    return {
      ...helper,
      earnedTokens,
      i18n: {
        ...helper.i18n,
        values: {
          ...helper.i18n.values,
          ...newValues,
        },
      },
    };
  }, [helper, earnedTokens]);
}

export type GovDescriptionProps = {
  vaultId: VaultEntity['id'];
};

export const GovDescription = memo<GovDescriptionProps>(function GovDescription({ vaultId }) {
  const { i18n } = useGovHelper(vaultId);
  return <Trans {...i18n} />;
});
