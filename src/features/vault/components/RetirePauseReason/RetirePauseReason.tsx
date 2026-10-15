import { css, type CssStyles } from '@repo/styles/css';
import { Fragment, memo, type ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import {
  isCowcentratedLikeVault,
  isVaultActive,
  isVaultRetired,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import {
  selectVaultById,
  selectVaultReplacementMigration,
} from '../../../data/selectors/vaults.ts';
import { ExternalLink } from '../../../../components/Links/ExternalLink.tsx';
import { InternalLink } from '../../../../components/Banners/Links/InternalLink.tsx';
import { getRetirePauseReasonKeys } from './reason-keys.ts';

export type RetirePauseReasonProps = {
  vaultId: VaultEntity['id'];
  css?: CssStyles;
};

const ScreamTx: Record<string, string> = {
  'scream-tusd':
    'https://ftmscan.com/tx/0x28a3991946cba505a406e912c2544ede2c19c1fde8b425451e229bd3ae5b8df2',
  'scream-frax':
    'https://ftmscan.com/tx/0x6bcb68dd92e1500e82a7f22ea7c17858a68c065eb4b4402d273885ccc8a6dc0f',
};

const linkClass = css({
  textDecoration: 'underline',
});

export const RetirePauseReason = memo(function RetirePauseReason({
  vaultId,
  css: cssProp,
}: RetirePauseReasonProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const migration = useAppSelector(state => selectVaultReplacementMigration(state, vaultId));

  const message = useMemo(() => {
    if (isVaultActive(vault)) {
      return null;
    }

    const reason = isVaultRetired(vault) ? vault.retireReason : vault.pauseReason;
    const keys = getRetirePauseReasonKeys({
      status: vault.status,
      reason,
      // CLM configs are priced as LPs too, but a panic leaves CLM users holding the two tokens
      holding: vault.depositTokenIsLp && !isCowcentratedLikeVault(vault) ? 'lp' : 'single',
      hasReplacement: !!migration,
    });
    const components: Record<string, ReactElement> = {
      Link: <ExternalLink className={linkClass} />,
    };
    if (migration) {
      components['VaultLink'] = (
        <InternalLink className={linkClass} to={`/vault/${migration.newVaultId}`} />
      );
    }
    if (reason === 'scream' && ScreamTx[vault.id]) {
      components['Tx'] = <ExternalLink className={linkClass} href={ScreamTx[vault.id]} />;
    }
    const values: Record<string, string> = {
      type:
        vault.type === 'cowcentrated' ? 'CLM'
        : vault.type === 'gov' ? 'pool'
        : 'vault',
    };

    return keys.map((key, i) => (
      <Fragment key={i}>
        {i > 0 ? ' ' : null}
        <Trans t={t} i18nKey={key} components={components} values={values} />
      </Fragment>
    ));
  }, [t, vault, migration]);

  return message ? <AlertWarning css={cssProp}>{message}</AlertWarning> : null;
});
