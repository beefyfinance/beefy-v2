import { type CssStyles } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts/Alerts.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { isGovVault, type VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

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

export const RetirePauseReason = memo(function RetirePauseReason({
  vaultId,
  css: cssProp,
}: RetirePauseReasonProps) {
  const { t, i18n } = useTranslation();
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
      let i18nKey = `Vault-${reason}-default`;

      if (reasonCode) {
        const maybeKey = `Vault-${reason}-${reasonCode}`;
        if (i18n.exists(maybeKey)) {
          if (reasonCode === 'bifiV2') {
            return (
              <Trans
                t={t}
                i18nKey={isGovVault(vault) ? `${maybeKey}-gov` : maybeKey}
                components={{
                  info: (
                    <a
                      href="https://snapshot.org/#/beefydao.eth/proposal/0x55e6ad9dd3ebcca3334e23872fa8e2ab1e926466b3d2d0af6f462cc45b1541a2"
                      target={'_blank'}
                      rel={'noopener'}
                    />
                  ),
                }}
              />
            );
          } else if (reasonCode === 'scream' && ScreamTx[vaultId]) {
            return (
              <Trans
                t={t}
                i18nKey={maybeKey}
                components={{
                  tx: <a href={ScreamTx[vaultId]} target={'_blank'} rel={'noopener'} />,
                  plan: (
                    <a
                      href="https://snapshot.org/#/screamsh.eth/proposal/0xcbf4a9d1c951a141a2fa806f7c7e6c4b2fea7db5952aee9e1dcc68b1c11adff9"
                      target={'_blank'}
                      rel={'noopener'}
                    />
                  ),
                }}
              />
            );
          } else if (reasonCode === 'bevelo') {
            return (
              <Trans
                t={t}
                i18nKey={maybeKey}
                components={{
                  pool: (
                    <a
                      href="https://app.beefy.com/vault/beefy-bevelo-v2-earnings"
                      target={'_blank'}
                      rel={'noopener'}
                    />
                  ),
                }}
              />
            );
          } else {
            i18nKey = maybeKey;
          }
        }
      }

      return t(i18nKey);
    }

    return null;
  }, [vault, t, i18n, vaultId]);

  return message ? <AlertWarning css={cssProp}>{message}</AlertWarning> : null;
});
