import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { entries } from '../../../../../../helpers/object.ts';
import type { VaultsViewMode } from '../../../../../data/reducers/vaults-list-types.ts';
import { setVaultsViewMode } from '../../../../../data/reducers/vaults-list.ts';
import { selectVaultsViewMode } from '../../../../../data/selectors/vaults-list.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';

const VIEW_MODE_OPTIONS: Record<VaultsViewMode, string> = {
  pro: 'Filter-ViewPro',
  simplified: 'Filter-ViewSimplified',
};

export const ViewModeFilter = memo(function ViewModeFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const options = useMemo(
    () => entries(VIEW_MODE_OPTIONS).map(([key, label]) => ({ value: key, label: t(label) })),
    [t]
  );
  const value = useAppSelector(selectVaultsViewMode);
  const handleChange = useCallback(
    (value: VaultsViewMode) => {
      dispatch(setVaultsViewMode(value));
    },
    [dispatch]
  );

  return <ToggleButtons value={value} options={options} onChange={handleChange} variant="filter" />;
});
