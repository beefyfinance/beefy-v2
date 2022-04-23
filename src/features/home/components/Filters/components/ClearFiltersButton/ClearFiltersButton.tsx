import { memo, useCallback } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectHasActiveFilter } from '../../../../../data/selectors/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { useTranslation } from 'react-i18next';

export type ClearFiltersButtonProps = {
  className?: string;
};
export const ClearFiltersButton = memo<ClearFiltersButtonProps>(function ClearFiltersButton({
  className,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const active = useAppSelector(selectHasActiveFilter);
  const handleReset = useCallback(() => {
    dispatch(filteredVaultsActions.reset());
  }, [dispatch]);

  return (
    <Button className={className} variant="filter" disabled={!active} onClick={handleReset}>
      {t('Filter-Reset')}
    </Button>
  );
});
