import { css, type CssStyles } from '@repo/styles/css';
import { memo, type ReactElement, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { ExternalLink } from '../../../../components/Links/ExternalLink.tsx';

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

  const message = useMemo(() => {
    let reason: string | undefined;
    let reasonCode: string | undefined;

    if (vault.status === 'eol') {
      reason = 'RetireReason';
      reasonCode = vault.retireReason;
    } else if (vault.status === 'paused') {
      reason = 'PauseReason';
      reasonCode = vault.pauseReason;
    }

    if (reason) {
      const components: Record<string, ReactElement> = {
        Link: <ExternalLink className={linkClass} />,
      };
      const values: Record<string, string> = {
        type:
          vault.type === 'cowcentrated' ? 'CLM'
          : vault.type === 'gov' ? 'pool'
          : 'vault',
      };

      if (reasonCode) {
        if (reasonCode === 'scream' && ScreamTx[vault.id]) {
          components['Tx'] = <ExternalLink className={linkClass} href={ScreamTx[vault.id]} />;
        }
      }

      return (
        <Trans
          t={t}
          i18nKey={[`Vault-${reason}-${reasonCode}`, `Vault-${reason}-default`]}
          components={components}
          values={values}
        />
      );
    }

    return null;
  }, [t, vault]);

  return message ? <AlertWarning css={cssProp}>{message}</AlertWarning> : null;
});
