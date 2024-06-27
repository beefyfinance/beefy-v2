import { memo, useCallback, useMemo } from 'react';
import {
  MultiToggleButton,
  MultiToggleButtons,
  type MultiToggleButtonProps,
} from '../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterAssetType } from '../../../../../data/selectors/filtered-vaults';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { TYPE_OPTIONS } from './type-options';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

export type AssetTypeButtonFilterProps = {
  className?: string;
};

const CategoryToggleButton = memo<MultiToggleButtonProps>(function CategoryToggleButton(props) {
  const classes = useStyles();
  const { value, label: originalLabel, onClick } = props;
  const label = useMemo(() => {
    const option = TYPE_OPTIONS[value];
    if (option && option.highlight) {
      return (
        <>
          {originalLabel} <span className={classes.highlight}>{option.highlight}</span>
        </>
      );
    }
    return originalLabel;
  }, [value, originalLabel, classes]);

  const handleClick = (isSelected: boolean, value: string) => {
    onClick(isSelected, value);
  };

  return <MultiToggleButton {...props} label={label} onClick={handleClick} />;
});

export const AssetTypeButtonFilter = memo<AssetTypeButtonFilterProps>(
  function AssetTypeButtonFilter({ className }) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const allKey = 'all';
    const options: Record<string, string> = useMemo(
      () =>
        Object.fromEntries(
          Object.entries(TYPE_OPTIONS)
            .filter(([key]) => key !== allKey)
            .map(([key, cat]) => [key, t(cat.i18nKey)])
        ),
      [t]
    );
    const value = useAppSelector(selectFilterAssetType);

    const handleChange = useCallback(
      selected => {
        dispatch(
          filteredVaultsActions.setAssetType(
            selected.length === Object.values(options).length
              ? []
              : (selected as FilteredVaultsState['assetType'])
          )
        );
      },
      [dispatch, options]
    );

    return (
      <MultiToggleButtons
        value={value}
        options={options}
        onChange={handleChange}
        buttonsClass={className}
        fullWidth={false}
        untoggleValue={allKey}
        ButtonComponent={CategoryToggleButton}
      />
    );
  }
);
