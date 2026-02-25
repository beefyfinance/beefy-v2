import { styled } from '@repo/styles/jsx';
import { type ComponentType, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import VisibilityOffOutlinedIcon from '../../../../images/icons/eyeOff.svg?react';
import VisibilityOutlinedIcon from '../../../../images/icons/eyeOn.svg?react';
import { setToggleHideBalance } from '../../../data/reducers/wallet/wallet.ts';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet.ts';
import { PortfolioStats } from './Stats/PortfolioStats.tsx';
import { PlatformStats } from './Stats/PlatformStats.tsx';
import { cva } from '@repo/styles/css';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';
import { selectUserHasDepositedInAnyVault } from '../../../data/selectors/balance.ts';

const modeToComponent: Record<'portfolio' | 'platform', ComponentType> = {
  portfolio: PortfolioStats,
  platform: PlatformStats,
};

export const HomeHeader = memo(function HomeHeader() {
  const { t } = useTranslation();
  const hasUserDeposited = useAppSelector(selectUserHasDepositedInAnyVault);
  const hasUserSelected = useRef(false);
  const [mode, setMode] = useState<'portfolio' | 'platform'>(() =>
    hasUserDeposited ? 'portfolio' : 'platform'
  );
  const Component = modeToComponent[mode];
  const handleModeChange = useCallback((newMode: 'portfolio' | 'platform') => {
    hasUserSelected.current = true;
    setMode(newMode);
  }, []);

  useEffect(() => {
    if (hasUserSelected.current) return;
    if (hasUserDeposited) {
      setMode('portfolio');
    }
  }, [hasUserDeposited]);

  return (
    <Container>
      <Stats>
        <ToggleButtons>
          <ToggleButton active={mode === 'platform'} onClick={() => handleModeChange('platform')}>
            {t('Vault-platform')}
          </ToggleButton>
          /
          <ToggleButton active={mode === 'portfolio'} onClick={() => handleModeChange('portfolio')}>
            {t('Portfolio-Portfolio')}
          </ToggleButton>
        </ToggleButtons>

        <VisibilityToggle />
      </Stats>
      <Component />
    </Container>
  );
});

const VisibilityToggle = memo(function VisibilityToggle() {
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useAppDispatch();
  const hideBalance = useAppSelector(selectIsBalanceHidden);

  const isDesktop = useBreakpoint({ from: 'md' });

  const updateHideBalance = useCallback(() => {
    dispatch(setToggleHideBalance());
  }, [dispatch]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, [setIsHovered]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, [setIsHovered]);

  // Show preview of next state on hover, otherwise show current state
  const showIcon = isHovered ? !hideBalance : hideBalance;

  const hoverText = useMemo(() => {
    if (hideBalance) {
      return 'Show sensitive data';
    }

    return 'Hide sensitive data';
  }, [hideBalance]);

  return (
    <ToggleButton
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={updateHideBalance}
    >
      {isDesktop && isHovered ? hoverText : null}
      {showIcon ?
        <VisibilityOffIcon active={true} />
      : <VisibilityOnIcon active={isHovered} />}
    </ToggleButton>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingBlock: '12px 16px',
    sm: {
      paddingBlock: '8px 24px',
    },
  },
});

const Stats = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingInline: '4px 10px',
  },
});

const ToggleButtons = styled('div', {
  base: {
    textStyle: 'label',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'text.dark',
  },
});

const ToggleButton = styled('button', {
  base: {
    textStyle: 'label',
    fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'text.dark',
    padding: 0,
    margin: 0,
    gap: '8px',
    '& svg': {
      height: '20px',
      width: '20px',
    },
  },
  variants: {
    active: {
      true: {
        color: 'text.light',
        pointerEvents: 'none',
      },
    },
  },
});

const recipe = cva({
  base: {},
  variants: {
    active: {
      true: {
        color: 'text.light',
      },
    },
  },
});

const VisibilityOffIcon = styled(VisibilityOffOutlinedIcon, recipe);
const VisibilityOnIcon = styled(VisibilityOutlinedIcon, recipe);
