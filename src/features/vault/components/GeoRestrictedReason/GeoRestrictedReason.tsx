import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultGeoRestrictedProfileId } from '../../../data/selectors/restrictions.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

export type GeoRestrictedReasonProps = {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
};

export const GeoRestrictedReason = memo(function GeoRestrictedReason({
  vaultId,
  css: cssProp,
}: GeoRestrictedReasonProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const profileId = useAppSelector(state => selectVaultGeoRestrictedProfileId(state, vaultId));

  return (
    <AlertWarning css={cssProp}>
      <Trans
        t={t}
        i18nKey={[`Vault-GeoRestricted-${profileId}`, 'Vault-GeoRestricted-default']}
        values={{
          type:
            vault.type === 'cowcentrated' ? 'CLM'
            : vault.type === 'gov' ? 'pool'
            : 'vault',
        }}
      />
    </AlertWarning>
  );
});
