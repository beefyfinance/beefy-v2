import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterPlatformId } from '../../../../../data/selectors/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectFilterPlatforms } from '../../../../../data/selectors/platforms';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';

export type PlatformDropdownFilterProps = {
  className?: string;
};

interface IListItem {
  label: string;
  value: string;
}

export const PlatformDropdownFilter = memo<PlatformDropdownFilterProps>(
  function PlatformDropdownFilter({ className }) {
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

    const value = useAppSelector(selectFilterPlatformId);
    const handleChange = useCallback(
      (event: ChangeEvent, option: IListItem) => {
        dispatch(
          filteredVaultsActions.setPlatformId(
            option.value === placeholderAllKey ? allKey : option.value
          )
        );
      },
      [dispatch]
    );

    return (
      <Autocomplete
        disablePortal={true}
        defaultValue={placeholderAllKey}
        autoComplete={true}
        getOptionLabel={(option: IListItem) => option.label}
        closeIcon={null}
        value={value}
        onChange={handleChange}
        className={className}
        id="platforms-filter"
        options={options}
        renderInput={params => <TextField {...params} label="Platform" />}
      />
    );
  }
);
