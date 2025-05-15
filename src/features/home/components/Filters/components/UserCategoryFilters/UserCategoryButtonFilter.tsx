import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { UserCategoryType } from '../../../../../data/reducers/filtered-vaults-types.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterUserCategory } from '../../../../../data/selectors/filtered-vaults.ts';
import { CATEGORY_OPTIONS } from './category-options.ts';

export const UserCategoryButtonFilter = memo(function UserCategoryButtonFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () => entries(CATEGORY_OPTIONS).map(([key, label]) => ({ value: key, label: t(label) })),
    [t]
  );
  const value = useAppSelector(selectFilterUserCategory);
  const handleChange = useCallback(
    (value: UserCategoryType) => {
      dispatch(filteredVaultsActions.setUserCategory(value));
    },
    [dispatch]
  );

  return <ToggleButtons value={value} options={options} onChange={handleChange} variant="filter" />;
});
