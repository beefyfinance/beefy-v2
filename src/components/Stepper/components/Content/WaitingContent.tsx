import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Title } from '../Title/Title.tsx';
import { Message } from './common/Common.tsx';

export const WaitingContent = memo(function WaitingContent() {
  const { t } = useTranslation();

  return (
    <>
      <Title text={t('Transactn-ConfirmPending')} />
      <Message>{t('Transactn-Wait')}</Message>
    </>
  );
});
