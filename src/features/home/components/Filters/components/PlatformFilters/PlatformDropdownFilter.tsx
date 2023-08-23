import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import type { LabelSearchSelectOptionType } from '../../../../../../components/LabeledSearchSelect';
import { LabeledSearchSelect } from '../../../../../../components/LabeledSearchSelect';
import { selectFilterPlatformId } from '../../../../../data/selectors/filtered-vaults';
import { isEmpty } from 'lodash-es';

export type PlatformDropdownFilterProps = {
  className?: string;
};

export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(
  function PlatformDropdownFilter({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
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

    const platformsIds = useAppSelector(selectFilterPlatformId);
    const handleChange = useCallback(
      (event: ChangeEvent, options: LabelSearchSelectOptionType[]) => {
        const hasNullOption = options.filter(option => {
          option.value === placeholderAllKey;
        });
        const platforms = !isEmpty(hasNullOption) ? [] : options.map(option => option.value);
        dispatch(filteredVaultsActions.setPlatformId(platforms));
      },
      [dispatch]
    );

    const valueLabel = useMemo(() => {
      return isEmpty(platformsIds)
        ? t('Filter-DropdwnDflt')
        : platformsIds.length === 1
        ? options[platformsIds[0]]
        : t('Select-CountSelected', { count: platformsIds.length });
    }, [options, t, platformsIds]);

    return (
      <LabeledSearchSelect
        className={className}
        label={t('Platform-Search-Filter-Label')}
        value={valueLabel}
        options={options}
        onChange={handleChange}
        selectedOptions={platformsIds}
        id="platforms"
        multiple={true}
      />
    );
  }
);
