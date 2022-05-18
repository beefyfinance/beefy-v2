import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults';
import { ChainEntity } from '../../../../../data/entities/chain';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { selectAllChains } from '../../../../../data/selectors/chains';
import {
  DropdownItemLabelProps,
  LabeledMultiSelect,
  SelectedItemProps,
} from '../../../../../../components/LabeledMultiSelect';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

const IconWithChain = memo<{ chainId: ChainEntity['id']; label: string; className?: string }>(
  function ({ chainId, label, className }) {
    const classes = useStyles();

    return (
      <div className={clsx(classes.iconWithChain, className)}>
        <img
          alt=""
          src={require(`../../../../../../images/networks/${chainId}.svg`).default}
          width={24}
          height={24}
          className={classes.iconWithChainIcon}
        />
        {label}
      </div>
    );
  }
);

const SelectedChain = memo<SelectedItemProps>(function ({
  value,
  options,
  allSelected,
  allSelectedLabel,
  countSelectedLabel,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  let label: string | ReactNode;

  if (allSelected) {
    label = t(allSelectedLabel);
  } else if (value.length === 1) {
    const chainId = value[0];
    label = (
      <IconWithChain
        chainId={chainId}
        label={options[chainId]}
        className={classes.iconWithChainSelected}
      />
    );
  } else {
    label = t(countSelectedLabel, { count: value.length });
  }

  return <>{label}</>;
});

const DropdownItemLabel = memo<DropdownItemLabelProps>(function DropdownItem({ label, value }) {
  return <IconWithChain chainId={value} label={label} />;
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
      label={t('Filter-Chain')}
      onChange={handleChange}
      value={selectedChainIds}
      options={options}
      sortOptions="label"
      selectClass={className}
      SelectedItemComponent={SelectedChain}
      DropdownItemLabelComponent={DropdownItemLabel}
    />
  );
});
