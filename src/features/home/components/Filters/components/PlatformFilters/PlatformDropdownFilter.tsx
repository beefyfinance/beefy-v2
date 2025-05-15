import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectMultiple } from '../../../../../../components/Form/Select/Multi/SelectMultiple.tsx';
import type { SelectMultiProps } from '../../../../../../components/Form/Select/types.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { PlatformEntity } from '../../../../../data/entities/platform.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterPlatformIds } from '../../../../../data/selectors/filtered-vaults.ts';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms.ts';

interface PlatformDropdownFilterProps {
  placement?: SelectMultiProps['placement'];
}

export const PlatformDropdownFilter = memo(function PlatformDropdownFilter({
  placement,
}: PlatformDropdownFilterProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const platforms = useAppSelector(selectFilterPlatforms);
  const options = useMemo(
    () =>
      platforms
        .map(platform => ({
          label: platform.name,
          value: platform.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [platforms]
  );

  const platformsIds = useAppSelector(selectFilterPlatformIds);

  const handleChange = useCallback(
    (selected: PlatformEntity['id'][]) => {
      dispatch(
        filteredVaultsActions.setPlatformIds(
          selected.length === platformsIds.length ? [] : selected
        )
      );
    },
    [dispatch, platformsIds]
  );

  return (
    <SelectMultiple
      searchEnabled={true}
      placement={placement}
      labelPrefix={t('Filter-Platform')}
      onChange={handleChange}
      selected={platformsIds}
      options={options}
      layer={1}
      variant="light"
    />
  );
});
