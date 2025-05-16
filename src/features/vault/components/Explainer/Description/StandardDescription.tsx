import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { type VaultEntity, type VaultStandard } from '../../../../data/entities/vault.ts';
import { type CommonHelper, isStandardCommonHelper, useCommonHelper } from './common.ts';
import { DescriptionLink } from './DescriptionLink/DescriptionLink.tsx';

type StandardHelper = CommonHelper<VaultStandard>;

function useStandardHelper(vaultId: VaultEntity['id']): StandardHelper {
  const helper = useCommonHelper(vaultId);
  if (!isStandardCommonHelper(helper)) {
    throw new Error('This hook is only for standard vaults');
  }

  return useMemo(() => {
    if (helper.vault.strategyTypeId !== 'glp-gmx') {
      return helper;
    }

    const newComponents = {
      details: (
        <DescriptionLink
          href={'https://beefy.com/articles/earn-glp-with-beefy-s-new-glp-strategy-and-vaults/'}
          label={helper.i18n.t('Details-Here')}
        />
      ),
    };

    return {
      ...helper,
      i18n: {
        ...helper.i18n,
        components: {
          ...helper.i18n.components,
          ...newComponents,
        },
      },
    };
  }, [helper]);
}

export type StandardDescriptionProps = {
  vaultId: VaultEntity['id'];
};

export const StandardDescription = memo(function StandardDescription({
  vaultId,
}: StandardDescriptionProps) {
  const { i18n } = useStandardHelper(vaultId);
  return <Trans {...i18n} />;
});
