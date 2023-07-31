import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts';
import type { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { useAppSelector } from '../../../../store';

export type RetirePauseReasonProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const RetirePauseReason = memo<RetirePauseReasonProps>(function RetirePauseReason({
  vaultId,
  className,
}) {
  const { t, i18n } = useTranslation();
  const { status, retireReason, pauseReason } = useAppSelector(state =>
    selectVaultById(state, vaultId)
  );

  const message = useMemo(() => {
    let reason = null;
    let reasonCode = null;

    if (status === 'eol') {
      reason = 'RetireReason';
      reasonCode = retireReason;
    } else if (status === 'paused') {
      reason = 'PauseReason';
      reasonCode = pauseReason;
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
                i18nKey={maybeKey}
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
  }, [t, i18n, status, retireReason, pauseReason]);

  return message ? <AlertWarning className={className}>{message}</AlertWarning> : null;
});
