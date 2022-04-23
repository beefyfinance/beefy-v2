import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults';
import { ChainEntity } from '../../../../../data/entities/chain';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectAllChains } from '../../../../../data/selectors/chains';
import {
  LabeledMultiSelect,
  SelectedItemProps,
} from '../../../../../../components/LabeledMultiSelect';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const IconWithChain = memo<{ chainId: ChainEntity['id']; label: string }>(function ({
  chainId,
  label,
}) {
  const classes = useStyles();

  return (
    <>
      <img
        alt=""
        src={require(`../../../../../../images/networks/${chainId}.svg`).default}
        width={20}
        height={20}
        className={classes.dropdownSelectedIcon}
      />
      {label}
    </>
  );
});

const SelectedChain = memo<SelectedItemProps>(function ({
  value,
  options,
  allSelected,
  allSelectedLabel,
  countSelectedLabel,
}) {
  const { t } = useTranslation();
  let label: string | ReactNode;

  if (allSelected) {
    label = t(allSelectedLabel);
  } else if (value.length === 1) {
    const chainId = value[0];
    label = <IconWithChain chainId={chainId} label={options[chainId]} />;
  } else {
    label = t(countSelectedLabel, { count: value.length });
  }

  return <>{label}</>;
});

export type ChainDropdownFilterProps = {
  className?: string;
};
export const ChainDropdownFilter = memo<ChainDropdownFilterProps>(function ChainDropdownFilter({
  className,
}) {
  const dispatch = useAppDispatch();
  const allChains = useAppSelector(selectAllChains);
  const selectedChainIds = useAppSelector(selectFilterChainIds);
  const { t } = useTranslation();

  const handleChange = useCallback(
    (selected: ChainEntity['id'][]) => {
      dispatch(
        filteredVaultsActions.setChainIds(selected.length === allChains.length ? [] : selected)
      );
    },
    [dispatch, allChains]
  );

  const options = useMemo(() => {
    return Object.fromEntries(allChains.map(chain => [chain.id, chain.name]));
  }, [allChains]);

  return (
    <LabeledMultiSelect
      label={t('Filter-Blockchn')}
      onChange={handleChange}
      value={selectedChainIds}
      options={options}
      sortOptions="label"
      allLabel={t('Filter-DropdwnDflt')}
      selectClass={className}
      SelectedItemComponent={SelectedChain}
    />
  );
});
