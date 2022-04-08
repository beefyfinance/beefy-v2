import React, { memo, PropsWithChildren, useCallback } from 'react';
import { ChainEntity } from '../../../data/entities/chain';
import { useSelector } from 'react-redux';
import { selectAllChainIds, selectChainById } from '../../../data/selectors/chains';
import { BeefyState } from '../../../../redux-types';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { featureFlag_chainSelectorToggle } from '../../../data/utils/feature-flags';

const useStyles = makeStyles(styles);

export type ChainButtonProps = PropsWithChildren<{
  id: ChainEntity['id'];
  selected: boolean;
  onChange: (selected: boolean, id: ChainEntity['id']) => void;
}>;
const ChainButton = memo<ChainButtonProps>(function ({ id, selected, onChange }) {
  const classes = useStyles();
  const chain = useSelector((state: BeefyState) => selectChainById(state, id));
  const handleChange = useCallback(() => {
    onChange(!selected, id);
  }, [id, selected, onChange]);

  return (
    <button
      onClick={handleChange}
      className={clsx(classes.button, { [classes.selected]: selected })}
    >
      <img
        className={classes.icon}
        alt={chain.name}
        src={require(`../../../../images/networks/${id}.svg`).default}
      />{' '}
    </button>
  );
});

export type ChainSelectorProps = PropsWithChildren<{
  selected: ChainEntity['id'][];
  onChange: (selected: ChainEntity['id'][]) => void;
  className?: string;
}>;
export const ChainSelector = memo<ChainSelectorProps>(function ({ selected, onChange, className }) {
  const classes = useStyles();
  const chainIds = useSelector(selectAllChainIds);
  const handleChange = useCallback(
    (isSelected, id) => {
      if (isSelected) {
        if (!selected.includes(id)) {
          const newSelected = [...selected, id];
          // if all selected, return empty array to represent not-filtered
          onChange(newSelected.length < chainIds.length ? newSelected : []);
        }
      } else if (!isSelected) {
        if (selected.length === 0) {
          // special handling:
          if (featureFlag_chainSelectorToggle()) {
            // first chain unselected should be treated as unselecting all other chains instead
            onChange([id]);
          } else {
            // include all but this one being unselected
            onChange(chainIds.filter(selectedId => selectedId !== id));
          }
        } else if (selected.includes(id)) {
          onChange(selected.filter(selectedId => selectedId !== id));
        }
      }
    },
    [chainIds, selected, onChange]
  );

  return (
    <div className={clsx(classes.selector, className)}>
      {chainIds.map(id => (
        <ChainButton
          key={id}
          id={id}
          selected={selected.length === 0 || selected.includes(id)}
          onChange={handleChange}
        />
      ))}
    </div>
  );
});
