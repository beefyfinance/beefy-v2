import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import type { LabelSearchSelectOptionType } from '../../../../../../components/LabeledSearchSelect';
import { LabeledSearchSelect } from '../../../../../../components/LabeledSearchSelect';
import { selectFilterPlatformId } from '../../../../../data/selectors/filtered-vaults';

export type PlatformDropdownFilterProps = {
  className?: string;
};

export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(
  function PlatformDropdownFilter({ className }) {
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
    const handleChange = useCallback(
      (event: ChangeEvent, option: LabelSearchSelectOptionType) => {
        dispatch(
          filteredVaultsActions.setPlatformId(
            option?.value === placeholderAllKey ? allKey : option.value
          )
        );
      },
      [dispatch]
    );

    const valueLabel = useMemo(() => {
      return value === allKey ? t('Filter-DropdwnDflt') : options[value];
    }, [options, t, value]);

    return (
      <LabeledSearchSelect
        className={className}
        label={t('Platform-Search-Filter-Label')}
        value={valueLabel}
        options={options}
        onChange={handleChange}
        id="platforms"
      />
    );
  }
);
