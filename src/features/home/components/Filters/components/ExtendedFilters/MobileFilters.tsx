import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import ClearIcon from '../../../../../../images/icons/clear.svg?react';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterChainIds,
  selectFilterContent,
  selectFilteredVaultCount,
  selectFilterPlatformIds,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainId } from '../../../../../data/entities/chain.ts';
import { isEqual } from 'lodash-es';

export type MobileFiltersProps = {
  open: boolean;
  onClose: () => void;
};

export const MobileFilters = memo<MobileFiltersProps>(function MobileFilters({ open, onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const content = useAppSelector(selectFilterContent);
  const [shadowOpacity, setShadowOpacity] = useState(100);
  const mainRef = useRef<HTMLDivElement>(null);
  const platforms = useAppSelector(selectFilterPlatformIds);
  const chains = useAppSelector(selectFilterChainIds);
  const [platformsCopy, setPlatformsCopy] = useState<string[]>(platforms);
  const [chainsCopy, setChainsCopy] = useState<ChainId[]>(chains);

  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = scrollTop / maxScroll;
      const opacity = Math.max(0, Math.min(100, 100 - scrollPercentage * 100));
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
    if (content === FilterContent.Filter) {
      dispatch(filteredVaultsActions.reset());
      onClose();
    }

    if (content === FilterContent.Platform) {
      if (!isEqual(platforms, platformsCopy)) {
        dispatch(filteredVaultsActions.setPlatformIds(platformsCopy));
      }
    }

    if (content === FilterContent.Chains) {
      if (!isEqual(chains, chainsCopy)) {
        dispatch(filteredVaultsActions.setChainIds(chainsCopy));
      }
    }

    dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
  }, [content, dispatch, onClose, platforms, platformsCopy, chains, chainsCopy]);

  const handleShow = useCallback(() => {
    if (content !== FilterContent.Filter) {
      dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
    } else {
      onClose();
    }
  }, [content, dispatch, onClose]);

  useEffect(() => {
    if (content === FilterContent.Platform) {
      setPlatformsCopy(platforms);
    }

    if (content === FilterContent.Chains) {
      setChainsCopy(chains);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, dispatch]);

  return (
    <Drawer scrollable={false} open={open} onClose={onClose} position="bottom">
      <Layout>
        <Main ref={mainRef}>
          <ExtendedFilters />
          <MobileSpacing />
        </Main>
        <Shadow style={{ opacity: `${shadowOpacity}%` }} />
        <Footer>
          <ClearButton borderless={true} onClick={handleReset}>
            {content !== FilterContent.Filter ?
              <>{t('Filter-Cancel')}</>
            : <>
                {t('Filter-Clear')}
                <CloseContainer>
                  <ClearIcon />
                </CloseContainer>
              </>
            }
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

const MobileSpacing = styled('div', {
  base: {
    height: '28px',
  },
});
