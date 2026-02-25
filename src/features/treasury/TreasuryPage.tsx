import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FullscreenTechLoader } from '../../components/TechLoader/TechLoader.tsx';
import { useAppDispatch, useAppSelector } from '../data/store/hooks.ts';
import { fetchTreasury } from '../data/actions/treasury.ts';
import { selectIsVaultsAvailable } from '../data/selectors/data-loader/config.ts';
import { DaoExposure } from './components/DaoExposure/DaoExposure.tsx';
import { DaoHoldings } from './components/DaoHoldings/DaoHoldings.tsx';
import { DaoSummary } from './components/DaoSummary/DaoSummary.tsx';
import {
  selectIsTreasuryLoaded,
  selectShouldInitTreasury,
} from '../data/selectors/data-loader/treasury.ts';
import { selectIsAddressBookLoadedGlobal } from '../data/selectors/data-loader/tokens.ts';
import { styled } from '@repo/styles/jsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';

const TreasuryPage = memo(function TreasuryPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const shouldInit = useAppSelector(selectShouldInitTreasury);
  const isLoaded = useAppSelector(selectIsTreasuryLoaded);
  const isAddressBookLoaded = useAppSelector(selectIsAddressBookLoadedGlobal);
  const vaultsLoaded = useAppSelector(selectIsVaultsAvailable);

  useEffect(() => {
    if (shouldInit && isAddressBookLoaded && vaultsLoaded) {
      dispatch(fetchTreasury());
    }
  }, [dispatch, shouldInit, isAddressBookLoaded, vaultsLoaded]);

  if (!isLoaded || !isAddressBookLoaded || !vaultsLoaded) {
    return <FullscreenTechLoader text={t('Treasury-Loading')} />;
  }

  return (
    <PageLayout
      header={<DaoSummary />}
      content={
        <Content>
          <DaoExposure />
          <DaoHoldings />
        </Content>
      }
    />
  );
});

const Content = styled('div', {
  base: {
    paddingBlock: '12px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    sm: {
      paddingBlock: '14px 28px',
      gap: '32px',
    },
    lg: {
      gap: '24px',
      paddingBlock: '14px 48px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default TreasuryPage;
