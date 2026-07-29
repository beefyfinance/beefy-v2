import { type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import {
  selectUserCountryCode,
  selectVaultGeoRestriction,
} from '../../../data/selectors/restrictions.ts';
import { selectTokenByAddressOrUndefined } from '../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

const regionNames = new Intl.DisplayNames('en', { type: 'region' });

function getRegionDisplayName(countryCode: string): string | undefined {
  try {
    return regionNames.of(countryCode);
  } catch {
    return undefined;
  }
}

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
  const restriction = useAppSelector(state => selectVaultGeoRestriction(state, vaultId));
  const countryCode = useAppSelector(selectUserCountryCode);
  const matchedToken = useAppSelector(state =>
    restriction?.tokenAddress ?
      selectTokenByAddressOrUndefined(state, vault.chainId, restriction.tokenAddress)
    : undefined
  );
  const asset = matchedToken?.symbol ?? restriction?.assetId ?? t('Vault-GeoRestricted-ThisAsset');
  const region = countryCode && getRegionDisplayName(countryCode);

  return (
    <AlertWarning css={cssProp}>
      <Trans
        t={t}
        i18nKey={
          region ?
            [`Vault-GeoRestricted-${restriction?.profileId}`, 'Vault-GeoRestricted-default']
          : [
              `Vault-GeoRestricted-${restriction?.profileId}-UnknownRegion`,
              'Vault-GeoRestricted-default-UnknownRegion',
            ]
        }
        values={{
          type:
            vault.type === 'cowcentrated' ? 'CLM'
            : vault.type === 'gov' ? 'pool'
            : 'vault',
          asset,
          region,
        }}
      />
    </AlertWarning>
  );
});
