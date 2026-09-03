import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TransactMode } from '../../../../features/data/reducers/wallet/transact-types.ts';
import { selectTransactMode } from '../../../../features/data/selectors/transact.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { SpinLoader } from '../../../SpinLoader/SpinLoader.tsx';
import { Title } from '../Title/Title.tsx';
import { Content, Message } from './common/Common.tsx';

export const BridgingContent = memo(function BridgingContent() {
  const { t } = useTranslation();
  const mode = useAppSelector(selectTransactMode);
  const titleKey =
    mode === TransactMode.Withdraw ? 'Transactn-Bridging-Withdraw' : 'Transactn-Bridging-Deposit';

  return (
    <>
      <Title
        text={
          <>
            {t(titleKey)}
            <SpinLoader size={20} css={css.raw({ marginLeft: '8px' })} />
          </>
        }
      />
      <Content variant="bridging">
        <Message>{t('Transactn-Bridging-Wait')}</Message>
      </Content>
    </>
  );
});
