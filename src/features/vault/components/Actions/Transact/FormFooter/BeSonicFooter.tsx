import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Notification } from '../../../../../../components/Notification.tsx';

const BeSonicFooter = memo(function BeSonicFooter() {
  const { t } = useTranslation();
  return (
    <Notification css={{ marginTop: '16px' }}>
      {t('Transact-Notice-BeSonicWithdrawTime')}
    </Notification>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BeSonicFooter;
