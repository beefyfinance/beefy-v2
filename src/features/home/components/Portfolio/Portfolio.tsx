import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import VisibilityOffOutlinedIcon from '../../../../images/icons/eyeOff.svg?react';
import VisibilityOutlinedIcon from '../../../../images/icons/eyeOn.svg?react';
import { setToggleHideBalance } from '../../../data/reducers/wallet/wallet.ts';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet.ts';
import { UserStats } from './Stats/UserStats.tsx';
import { VaultsStats } from './Stats/VaultsStats.tsx';

export const Portfolio = memo(function Portfolio() {
  const { t } = useTranslation();

  return (
    <Stats>
      <Group side={'left'}>
        <Title>
          {t('Portfolio-Portfolio')} <VisibilityToggle />
        </Title>
        <UserStats />
      </Group>
      <Group side={'right'}>
        <Title>{t('Vault-platform')}</Title>
        <VaultsStats />
      </Group>
    </Stats>
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
        <VisibilityOutlinedIcon />
      : <VisibilityOffOutlinedIcon />}
    </ToggleButton>
  );
});

const Stats = styled('div', {
  base: {
    paddingTop: '16px',
    paddingBottom: '32px',
    display: 'grid',
    gridTemplateColumns: '100%',
    gap: '24px',
    md: {
      gridTemplateColumns: '583fr 417fr',
      paddingBottom: '40px',
      gap: '32px',
    },
  },
});

const Group = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  variants: {
    side: {
      left: {},
      right: {
        md: {
          textAlign: 'right',
          justifyContent: 'flex-end',
        },
      },
    },
  },
  defaultVariants: {
    side: 'left',
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'h3',
    color: 'text.middle',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'inherit',
    columnGap: '8px',
  },
});

const ToggleButton = styled('button', {
  base: {
    color: 'text.middle',
  },
});
