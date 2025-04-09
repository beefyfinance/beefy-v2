import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '@repo/styles/css';

const BeSonicFooter = memo(function BeSonicFooter() {
  const { t } = useTranslation();
  // TODO beSonic -- tidy styles
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        columnGap: '8px',
        minWidth: 0,
        width: '100%',
        borderRadius: '8px',
        padding: '16px',
        alignItems: 'center',
        textAlign: 'center',
        backgroundColor: 'alert.warning.background',
        color: 'text.middle',
        marginTop: '16px',
      })}
    >
      {t('Transact-Notice-BeSonicWithdrawTime')}
    </div>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BeSonicFooter;
