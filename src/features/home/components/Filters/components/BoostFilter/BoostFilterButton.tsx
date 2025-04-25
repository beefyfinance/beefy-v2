import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterBoolean } from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import BoostSvg from '../../../../../../images/icons/boost.svg?react';
import { styled } from '@repo/styles/jsx';

export const BoostFilterButton = memo(function BoostFilterButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const value = useAppSelector(state => selectFilterBoolean(state, 'onlyBoosted'));
  const handleChange = useCallback(() => {
    dispatch(filteredVaultsActions.setBoolean({ filter: 'onlyBoosted', value: !value }));
  }, [dispatch, value]);

  return (
    <BoostButton variant="filter" onClick={handleChange} data-active={value || undefined}>
      {t('Boosted')}
      <BoostIcon />
    </BoostButton>
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
});
