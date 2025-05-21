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

export const Count = styled('span', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: '0',
    flexGrow: '0',
    width: '20px',
    height: '20px',
    '&:before': {
      boxShadow:
        '0px 24.3px 36px 0px rgba(0, 0, 0, 0.40), 0px 7.326px 10.853px 0px rgba(0, 0, 0, 0.26), 0px 3.043px 4.508px 0px rgba(0, 0, 0, 0.20), 0px 1.1px 1.63px 0px rgba(0, 0, 0, 0.14)',
      textStyle: 'body.sm.medium',
      content: 'attr(data-count)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: '0',
      flexGrow: '0',
      backgroundColor: 'gold.80-32',
      width: '20px',
      height: '20px',
      borderRadius: '3.6px',
      color: 'text.boosted',
    },
  },
});
