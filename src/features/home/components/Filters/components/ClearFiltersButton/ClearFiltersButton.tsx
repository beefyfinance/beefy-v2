import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
} from '../../../../../data/selectors/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { useTranslation } from 'react-i18next';
import { Clear } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type ClearFiltersButtonProps = {
  className?: string;
};
export const ClearFiltersButton = memo<ClearFiltersButtonProps>(function ClearFiltersButton({
  className,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectHasActiveFilter);
  const count = useAppSelector(selectFilterPopinFilterCount);
  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
  }, [dispatch]);

  return (
    <Button
      className={className}
      variant="filter"
      size="sm"
      disabled={!active}
      onClick={handleReset}
    >
      {count > 0 ? (
        <span className={classes.badge} data-count={count} />
      ) : (
        <Clear className={classes.icon} />
      )}
      {t('Filter-ClearAll')}
    </Button>
  );
});
