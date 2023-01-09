import { memo } from 'react';
import { AlertWarning } from '../../../../../../components/Alerts';
import { useTranslation } from 'react-i18next';

export type EmeraldGasNoticeProps = {
  className?: string;
};
export const EmeraldGasNotice = memo<EmeraldGasNoticeProps>(function ({ className }) {
  const { t } = useTranslation();
  return <AlertWarning className={className}>{t('Transact-Notice-EmeraldGas')} </AlertWarning>;
});
