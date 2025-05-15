import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type { TokenEntity } from '../../../../data/entities/token.ts';
import { type VaultEntity, type VaultGov } from '../../../../data/entities/vault.ts';
import { selectGovVaultEarnedTokens } from '../../../../data/selectors/tokens.ts';
import { type CommonHelper, isGovCommonHelper, useCommonHelper } from './common.ts';

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
    const newValues: Record<string, string> = {
      earnedToken: earnedTokens[0].symbol,
    };
    for (let i = 0; i < earnedTokens.length; ++i) {
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

export const GovDescription = memo(function GovDescription({ vaultId }: GovDescriptionProps) {
  const { i18n } = useGovHelper(vaultId);
  return <Trans {...i18n} />;
});
