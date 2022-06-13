import React, { memo } from 'react';
import {
  DropdownItemLabelProps,
  LabeledSelect,
  LabeledSelectProps,
  SelectedItemProps,
} from '../../../LabeledSelect';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type IconWithChainProps = {
  label: string;
  chainId: string;
};
const IconWithChain = memo<IconWithChainProps>(function IconWithChain({ label, chainId }) {
  const classes = useStyles();

  return (
    <div className={classes.iconWithChain}>
      <img
        alt=""
        src={require(`../../../../images/networks/${chainId}.svg`).default}
        width={20}
        height={20}
        className={classes.iconWithChainIcon}
      />
      {label}
    </div>
  );
});

const SelectedItem = memo<SelectedItemProps>(function ({ value, options }) {
  return <IconWithChain label={options[value]} chainId={value} />;
});

const DropdownItemLabel = memo<DropdownItemLabelProps>(function DropdownItem({ label, value }) {
  return <IconWithChain label={label} chainId={value} />;
});

export type ChainSelectorProps = Omit<
  LabeledSelectProps,
  'SelectedItemComponent' | 'DropdownItemLabelComponent'
>;
export const ChainSelector = memo<LabeledSelectProps>(function ChainSelector(props) {
  const classes = useStyles();

  return (
    <LabeledSelect
      SelectedItemComponent={SelectedItem}
      DropdownItemLabelComponent={DropdownItemLabel}
      selectClass={classes.select}
      selectIconClass={classes.selectIcon}
      {...props}
    />
  );
});
