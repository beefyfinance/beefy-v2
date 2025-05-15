import { type CssStyles } from '@repo/styles/css';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import Clear from '../../../../../../images/icons/mui/Clear.svg?react';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { styles } from './styles.ts';

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
      {count > 0 ?
        <span className={classes.badge} data-count={count} />
      : <Clear className={classes.icon} />}
      {t('Filter-ClearAll')}
    </Button>
  );
});
