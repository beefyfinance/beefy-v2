import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import {
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useTranslation } from 'react-i18next';
import Clear from '../../../../../../images/icons/mui/Clear.svg?react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type ClearFiltersButtonProps = {
  css?: CssStyles;
};
export const ClearFiltersButton = memo(function ClearFiltersButton({
  css: cssProp,
}: ClearFiltersButtonProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectHasActiveFilter);
  const count = useAppSelector(selectFilterPopinFilterCount);
  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
  }, [dispatch]);

  return (
    <Button css={cssProp} variant="filter" size="sm" disabled={!active} onClick={handleReset}>
      {count > 0 ? (
        <span className={classes.badge} data-count={count} />
      ) : (
        <Clear className={classes.icon} />
      )}
      {t('Filter-ClearAll')}
    </Button>
  );
});
