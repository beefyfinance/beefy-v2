import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import { selectFilterPlatformIds } from '../../../../../data/selectors/filtered-vaults';
import type { PlatformEntity } from '../../../../../data/entities/platform';
import { LabeledSearchMultiSelect } from '../../../../../../components/LabeledSearchMultiSelect';
import type { LabeledSelectCommonProps } from '../../../../../../components/LabeledSelect';

interface PlatformDropdownFilterProps {
  placement?: LabeledSelectCommonProps['placement'];
  dropDownShift?: LabeledSelectCommonProps['dropdownShift'];
  dropDownFlip?: LabeledSelectCommonProps['dropdownFlip'];
}

export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(
  function PlatformDropdownFilter({ placement, dropDownFlip, dropDownShift }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const platforms = useAppSelector(selectFilterPlatforms);
    const options = useMemo(
      () => Object.fromEntries(platforms.map(platform => [platform.id, platform.name])),
      [platforms]
    ) satisfies Record<string, string>;

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
      <LabeledSearchMultiSelect
        label={t('Filter-Platform')}
        onChange={handleChange}
        value={platformsIds}
        options={options}
        sortOptions="label"
        fullWidth={true}
        placement={placement}
        dropdownFlip={dropDownFlip}
        dropdownShift={dropDownShift}
        dropdownAutoHide={false}
      />
    );
  }
);
