import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import type { LabelSearchSelectOptionType } from '../../../../../../components/LabeledSearchSelect';
import { LabeledSearchSelect } from '../../../../../../components/LabeledSearchSelect';

export type PlatformDropdownFilterProps = {
  className?: string;
};

export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(
  function PlatformDropdownFilter() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const allKey = null;
    const placeholderAllKey = '__null';
    const otherKey = 'other';
    const platforms = useAppSelector(selectFilterPlatforms);
    const options = useMemo(() => {
      const wrappedPlatforms = platforms.map(platform => {
        return { label: platform.name, value: platform.id };
      });
      return [
        { label: t('Filter-DropdwnDflt'), value: placeholderAllKey },
        { label: t('Filter-Other'), value: otherKey },
        ...wrappedPlatforms,
      ];
    }, [platforms, t]);

    // const value = useAppSelector(selectFilterPlatformId);
    const handleChange = useCallback(
      (event: ChangeEvent, option: LabelSearchSelectOptionType) => {
        dispatch(
          filteredVaultsActions.setPlatformId(
            option.value === placeholderAllKey ? allKey : option.value
          )
        );
      },
      [dispatch]
    );

    return <LabeledSearchSelect options={options} onChange={handleChange} id="platforms" />;
  }
);
