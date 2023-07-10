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
                  link: <BIFIV2Link />,
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

const BIFIV2Link = memo(function BIFIV2Link() {
  const { t } = useTranslation();
  return (
    <a
      href={
        'https://vote.beefy.finance/#/proposal/0xdd3cc7640a784f78621062ccd0641d765f5ca9dcc91dfaa823e19329ee8f77f5'
      }
      target="_blank"
      rel="noopener"
    >
      {t('More-info')}.
    </a>
  );
});
