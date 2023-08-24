import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import { selectFilterPlatformId } from '../../../../../data/selectors/filtered-vaults';
import type { PlatformEntity } from '../../../../../data/entities/platform';
import { LabeledSearchMultiSelect } from '../../../../../../components/LabeledSearchMultiSelect';

export const PlatformDropdownFilter = memo(function PlatformDropdownFilter() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const otherKey = 'other';
  const platforms = useAppSelector(selectFilterPlatforms);
  const options = useMemo(
    () =>
      Object.fromEntries([
        ...platforms.map(platform => [platform.id, platform.name]),
        [otherKey, t('Filter-Other')],
      ]),
    [platforms, t]
  ) satisfies Record<string, string>;

  const platformsIds = useAppSelector(selectFilterPlatformId);

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
    <LabeledSearchMultiSelect
      label={t('Filter-Platform')}
      onChange={handleChange}
      value={platformsIds}
      options={options}
      sortOptions="label"
      fullWidth={true}
    />
  );
});
