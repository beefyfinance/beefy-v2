import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  isCowcentratedGovVault,
  isVaultRetired,
  type VaultEntity,
} from '../../../../../data/entities/vault.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';

export const MigrateNotice = memo(function MigrateNotice({
  oldVaultId,
  newVaultId,
}: {
  oldVaultId: VaultEntity['id'];
  newVaultId: VaultEntity['id'];
}) {
  const { t } = useTranslation();
  const oldVault = useAppSelector(state => selectVaultById(state, oldVaultId));
  const newVault = useAppSelector(state => selectVaultById(state, newVaultId));

  // a CLM pool can migrate into the replacement's vault, so each side is named by its own kind
  const nounOf = (vault: VaultEntity) =>
    t(isCowcentratedGovVault(vault) ? 'ReplacementVault-Noun-pool' : 'ReplacementVault-Noun-vault');

  const i18nKey =
    isVaultRetired(oldVault) ? 'ReplacementVault-Notice-Retired' : 'ReplacementVault-Notice';

  return (
    <Notice>
      <Trans
        t={t}
        i18nKey={i18nKey}
        p
        values={{ type: nounOf(oldVault), newType: nounOf(newVault) }}
      />
    </Notice>
  );
});

export const MigrateZapNotice = memo(function MigrateZapNotice() {
  const { t } = useTranslation();

  return (
    <Zap>
      <Trans t={t} i18nKey="ReplacementVault-Zap" components={{ Highlight: <Highlight /> }} />
    </Zap>
  );
});

const Notice = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.middle',
  },
});

const Zap = styled('div', {
  base: {
    textStyle: 'body',
    color: 'text.middle',
  },
});

const Highlight = styled('span', {
  base: {
    color: 'text.warning',
  },
});
