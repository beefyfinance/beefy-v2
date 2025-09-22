import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import Clear from '../../../../../../images/icons/clear.svg?react';
import { type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { Count } from '../../../../../../components/Count/Count.tsx';

export type ClearFiltersButtonProps = {
  css?: CssStyles;
};
export const ClearFiltersButton = memo(function ClearFiltersButton({
  css: cssProp,
}: ClearFiltersButtonProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectHasActiveFilter);
  const count = useAppSelector(selectFilterPopinFilterCount);
  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
  }, [dispatch]);

  return (
    <ClearFilter
      css={cssProp}
      borderless={true}
      variant="filter"
      size="sm"
      disabled={!active}
      onClick={handleReset}
    >
      {t('Filter-ClearAll')}
      {count > 0 ?
        <Count data-count={count} />
      : <ClearContainer>
          <Clear />
        </ClearContainer>
      }
    </ClearFilter>
  );
});

const ClearContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    '& svg': {
      width: '14px',
      height: '14px',
    },
  },
});

const ClearFilter = styled(Button, {
  base: {
    paddingInline: '16px 10px',
    paddingBlock: '8px',
    marginLeft: 'auto',
    gap: '8px',
  },
});
