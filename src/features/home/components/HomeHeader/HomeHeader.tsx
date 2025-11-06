import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import VisibilityOffOutlinedIcon from '../../../../images/icons/eyeOff.svg?react';
import VisibilityOutlinedIcon from '../../../../images/icons/eyeOn.svg?react';
import { setToggleHideBalance } from '../../../data/reducers/wallet/wallet.ts';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../../data/selectors/wallet.ts';
import { PortfolioStats } from './Stats/PortfolioStats.tsx';
import { PlatformStats } from './Stats/PlatformStats.tsx';
import { cva } from '@repo/styles/css';
import { useBreakpoint } from '../../../../components/MediaQueries/useBreakpoint.ts';

const modeToComponent: Record<'portfolio' | 'platform', ComponentType> = {
  portfolio: PortfolioStats,
  platform: PlatformStats,
};

export const HomeHeader = memo(function HomeHeader() {
  const isWalletConnected = useAppSelector(selectIsWalletKnown);

  const { t } = useTranslation();
  const [mode, setMode] = useState<'portfolio' | 'platform'>(
    isWalletConnected ? 'portfolio' : 'platform'
  );

  const Component = modeToComponent[mode];
  const handleModeChange = useCallback(
    (newMode: 'portfolio' | 'platform') => {
      setMode(newMode);
    },
    [setMode]
  );

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

  return (
    <ToggleButton
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={updateHideBalance}
    >
      {isDesktop && isHovered && !hideBalance ? 'Hide sensitive data' : null}
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
      paddingBlock: '0px 24px',
    },
  },
});

const Stats = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingInline: '4px 8px',
  },
});

const ToggleButtons = styled('div', {
  base: {
    textStyle: 'subline.sm.semiBold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'text.dark',
  },
});

const ToggleButton = styled('button', {
  base: {
    textStyle: 'subline.sm.semiBold',
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
