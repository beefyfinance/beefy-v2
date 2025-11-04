import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import VisibilityOffOutlinedIcon from '../../../../images/icons/eyeOff.svg?react';
import VisibilityOutlinedIcon from '../../../../images/icons/eyeOn.svg?react';
import { setToggleHideBalance } from '../../../data/reducers/wallet/wallet.ts';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet.ts';
import { PortfolioStats } from './Stats/PortfolioStats.tsx';
import { PlatformStats } from './Stats/PlatformStats.tsx';

const modeToComponent: Record<'portfolio' | 'vaults', ComponentType> = {
  portfolio: PortfolioStats,
  vaults: PlatformStats,
};

export const Portfolio = memo(function Portfolio() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'portfolio' | 'vaults'>('portfolio');

  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (newMode: 'portfolio' | 'vaults') => {
      setMode(newMode);
    },
    [setMode]
  );

  return (
    <Container>
      <Stats>
        <ToggleButtons>
          <ToggleButton active={mode === 'vaults'} onClick={() => handleModeChange('vaults')}>
            {t('Vault-platform')}
          </ToggleButton>
          /
          <ToggleButton active={mode === 'portfolio'} onClick={() => handleModeChange('portfolio')}>
            {t('Portfolio-Portfolio')}
          </ToggleButton>
        </ToggleButtons>
        <div>
          <VisibilityToggle />
        </div>
      </Stats>
      <Component />
    </Container>
  );
});

const VisibilityToggle = memo(function VisibilityToggle() {
  const dispatch = useAppDispatch();
  const hideBalance = useAppSelector(selectIsBalanceHidden);

  const updateHideBalance = useCallback(() => {
    dispatch(setToggleHideBalance());
  }, [dispatch]);

  return (
    <ToggleButton onClick={updateHideBalance}>
      {hideBalance ?
        <VisibilityOffOutlinedIcon />
      : <VisibilityOutlinedIcon />}
    </ToggleButton>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
    sm: {
      marginBottom: '24px',
    },
  },
});

const Stats = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const ToggleButtons = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textStyle: 'subline.sm.semiBold',
    color: 'text.middle',
  },
});

const ToggleButton = styled('button', {
  base: {
    textStyle: 'subline.sm.semiBold',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'text.middle',
    padding: 0,
    margin: 0,
  },
  variants: {
    active: {
      true: {
        color: 'text.light',
      },
    },
  },
});
