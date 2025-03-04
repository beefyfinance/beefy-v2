import { memo } from 'react';
import { AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { useTranslation } from 'react-i18next';
import { type CssStyles } from '@repo/styles/css';

export type EmeraldGasNoticeProps = {
  css?: CssStyles;
};
export const EmeraldGasNotice = memo(function EmeraldGasNotice({
  css: cssProp,
}: EmeraldGasNoticeProps) {
  const { t } = useTranslation();
  return <AlertWarning css={cssProp}>{t('Transact-Notice-EmeraldGas')} </AlertWarning>;
});
