import { memo, useCallback } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import CloseOutlined from '../../../../../../images/icons/mui/CloseOutlined.svg?react';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilteredVaultCount } from '../../../../../data/selectors/filtered-vaults.ts';

export type MobileFiltersProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileFilters = memo<MobileFiltersProps>(function MobileFilters({ open, onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);

  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
    onClose();
  }, [dispatch, onClose]);

  return (
    <Drawer scrollable={false} open={open} onClose={onClose} position="bottom">
      <Layout>
        <Main>
          <ExtendedFilters />
        </Main>
        <Footer>
          <Button borderless={true} onClick={handleReset}>
            {t('Filter-Clear')} <CloseOutlined />
          </Button>
          <Button variant="success" borderless={true} onClick={() => onClose()}>
            {t('Filter-ShownVaults', { number: filteredVaultCount })}
          </Button>
        </Footer>
      </Layout>
    </Drawer>
  );
});

const Layout = styled('div', {
  base: {
    backgroundColor: 'background.header',
    height: '100vh',
    maxHeight: '100%',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
  },
});

const Main = styled('div', {
  base: {
    padding: '16px',
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
});

const Footer = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '40% 60%',
    alignItems: 'center',
    padding: '0px 20px 32px 20px',
    gap: '12px',
    justifyContent: 'space-between',
  },
});
