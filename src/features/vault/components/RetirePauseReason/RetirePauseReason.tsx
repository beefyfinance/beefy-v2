import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts';
import { VaultEntity } from '../../../data/entities/vault';
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
          i18nKey = maybeKey;
        }
      }

      return t(i18nKey);
    }

    return null;
  }, [t, i18n, status, retireReason, pauseReason]);

  return message ? <AlertWarning className={className}>{message}</AlertWarning> : null;
});
