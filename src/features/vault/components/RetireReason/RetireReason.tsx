import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../components/Alerts';

export type RetireReasonProps = {
  reasonCode: string;
  className?: string;
};

export const RetireReason = memo<RetireReasonProps>(function RetireReason({
  reasonCode,
  className,
}) {
  const { t, i18n } = useTranslation();
  const message = useMemo(() => {
    let i18nKey = 'Vault-RetireReason-default';
    if (reasonCode) {
      const maybeKey = `Vault-RetireReason-${reasonCode}`;

      if (i18n.exists(maybeKey)) {
        i18nKey = maybeKey;
      }
    }

    return t(i18nKey);
  }, [t, i18n, reasonCode]);

  return <AlertWarning className={className}>{message}</AlertWarning>;
});
