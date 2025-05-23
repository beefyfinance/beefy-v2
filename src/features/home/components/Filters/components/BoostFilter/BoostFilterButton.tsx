import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { selectFilterBoolean } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import BoostSvg from '../../../../../../images/icons/boost.svg?react';
import { styled } from '@repo/styles/jsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { css } from '@repo/styles/css';

export const BoostFilterButton = memo(function BoostFilterButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBoolean(state, 'onlyBoosted'));
  const handleChange = useCallback(() => {
    dispatch(filteredVaultsActions.setBoolean({ filter: 'onlyBoosted', value: !value }));
  }, [dispatch, value]);

  return (
    <BoostButton size="sm" variant="filter" onClick={handleChange} data-active={value || undefined}>
      {t('Filter-Boosts')}
      <BoostIcon />
    </BoostButton>
  );
});

export const BoostCheckBox = memo(function BoostCheckBox() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBoolean(state, 'onlyBoosted'));
  const handleChange = useCallback(() => {
    dispatch(filteredVaultsActions.setBoolean({ filter: 'onlyBoosted', value: !value }));
  }, [dispatch, value]);

  return (
    <BoostCheckBoxContainer>
      <LabelledCheckbox
        labelCss={css.raw({ paddingBlock: 0 })}
        checked={value}
        onChange={handleChange}
        label={t('Filter-Boosts')}
        endAdornment={<BoostIcon size="lg" />}
      />
    </BoostCheckBoxContainer>
  );
});

const BoostButton = styled(Button, {
  base: {
    display: 'flex',
    gap: '4px',
  },
});

const BoostIcon = styled(BoostSvg, {
  base: {
    color: 'text.boosted',
    height: '16px',
    width: '14px',
  },
  variants: {
    size: {
      lg: {
        height: '20px',
        width: '20px',
      },
    },
  },
});

const BoostCheckBoxContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
