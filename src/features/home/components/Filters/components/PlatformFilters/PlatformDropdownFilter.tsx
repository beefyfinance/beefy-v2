import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterPlatformId } from '../../../../../data/selectors/filtered-vaults';
import { ToggleButtonsProps } from '../../../../../../components/ToggleButtons';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { LabeledSelect } from '../../../../../../components/LabeledSelect';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';

export type PlatformDropdownFilterProps = {
  className?: string;
};
export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const allKey = null;
  const placeholderAllKey = '__null';
  const otherKey = 'other';
  const platforms = useAppSelector(selectFilterPlatforms);
  const options: Record<string, string> = useMemo(
    () =>
      Object.fromEntries([
        [placeholderAllKey, t('Filter-DropdwnDflt')],
        ...platforms.map(platform => [platform.id, platform.name]),
        [otherKey, t('Filter-Other')],
      ]),
    [platforms, t]
  );
  const value = useAppSelector(selectFilterPlatformId);
  const handleChange = useCallback<ToggleButtonsProps['onChange']>(
    value => {
      dispatch(filteredVaultsActions.setPlatformId(value === placeholderAllKey ? allKey : value));
    },
    [dispatch, placeholderAllKey, allKey]
  );

  return (
    <LabeledSelect
      label={t('Filter-Platform')}
      value={value === allKey ? placeholderAllKey : value}
      options={options}
      onChange={handleChange}
      selectClass={className}
      fullWidth={false}
      sortOptions="label"
      defaultValue={placeholderAllKey}
    />
  );
});
