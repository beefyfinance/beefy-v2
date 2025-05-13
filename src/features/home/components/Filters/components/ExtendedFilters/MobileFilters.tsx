import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import ClearIcon from '../../../../../../images/icons/clear.svg?react';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterContent,
  selectFilteredVaultCount,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
export type MobileFiltersProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileFilters = memo<MobileFiltersProps>(function MobileFilters({ open, onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const content = useAppSelector(selectFilterContent);
  const [shadowOpacity, setShadowOpacity] = useState(1);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = scrollTop / maxScroll;
      const opacity = Math.max(0, Math.min(1, 1 - scrollPercentage));
      setShadowOpacity(opacity);
    }
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
    onClose();
    dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
  }, [dispatch, onClose]);

  const handleShow = useCallback(() => {
    if (content !== FilterContent.Filter) {
      dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
    } else {
      onClose();
    }
  }, [dispatch, onClose, content]);

  return (
    <Drawer scrollable={false} open={open} onClose={onClose} position="bottom">
      <Layout>
        <Main ref={mainRef}>
          <ExtendedFilters />
        </Main>
        <Shadow style={{ opacity: shadowOpacity }} />
        <Footer>
          <ClearButton borderless={true} onClick={handleReset}>
            {t('Filter-Clear')}
            <CloseContainer>
              <ClearIcon />
            </CloseContainer>
          </ClearButton>
          <Button style={{ width: '70%' }} variant="success" borderless={true} onClick={handleShow}>
            {t('Filter-ShownVaults', { number: filteredVaultCount })}
          </Button>
        </Footer>
      </Layout>
    </Drawer>
  );
});

const Layout = styled('div', {
  base: {
    backgroundColor: 'darkBlue.90',
    height: '100dvh',
    maxHeight: '100dvh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
  },
});

const Main = styled('div', {
  base: {
    flex: '1 1 auto',
    overflowY: 'auto',
    position: 'relative',
  },
});

const Footer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 20px 32px 20px',
    gap: '12px',
    justifyContent: 'space-between',
  },
});

const ClearButton = styled(Button, {
  base: {
    gap: '4px',
    width: '30%',
  },
});

const CloseContainer = styled('div', {
  base: {
    height: '20px',
    width: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& svg': {
      height: '15px',
      width: '15px',
    },
  },
});

const Shadow = styled('div', {
  base: {
    position: 'absolute',
    pointerEvents: 'none',
    transition: 'opacity 0.2s linear',
    left: '0',
    right: '0',
    bottom: '80px',
    height: '55px',
    background: 'linear-gradient(0deg, #111321 2.91%, rgba(17, 19, 33, 0) 100%)',
  },
});
