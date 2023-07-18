import type { FC, SVGProps } from 'react';
import React, { memo, useCallback } from 'react';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { selectActiveChainIds, selectChainById } from '../../../../../data/selectors/chains';
import { makeStyles, Tooltip } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { useAppSelector } from '../../../../../../store';
import { NewBadge } from '../../../../../../components/Header/components/Badges/NewBadge';

const useStyles = makeStyles(styles);
const networkIcons = import.meta.glob<FC<SVGProps<SVGSVGElement>>>(
  '../../../../../../images/networks/*.svg',
  {
    eager: true,
    import: 'ReactComponent',
  }
);

type ChainButtonProps = {
  id: ChainEntity['id'];
  selected: boolean;
  onChange: (selected: boolean, id: ChainEntity['id']) => void;
};
const ChainButton = memo<ChainButtonProps>(function ChainButton({ id, selected, onChange }) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, id));
  const handleChange = useCallback(() => {
    onChange(!selected, id);
  }, [id, selected, onChange]);
  const Icon: FC<SVGProps<SVGSVGElement>> =
    networkIcons[`../../../../../../images/networks/${id}.svg`];

  return (
    <Tooltip
      disableFocusListener
      disableTouchListener
      title={chain.name}
      placement="top-start"
      classes={{ tooltip: classes.tooltip }}
    >
      <button
        onClick={handleChange}
        className={clsx(classes.button, { [classes.selected]: selected })}
      >
        {chain.new ? <NewBadge className={classes.badge} /> : null}
        <Icon className={classes.icon} width={24} height={24} />
      </button>
    </Tooltip>
  );
});

export type ChainButtonSelectorProps = {
  selected: ChainEntity['id'][];
  onChange: (selected: ChainEntity['id'][]) => void;
  className?: string;
};
export const ChainButtonSelector = memo<ChainButtonSelectorProps>(function ChainButtonSelector({
  selected,
  onChange,
  className,
}) {
  const classes = useStyles();
  const chainIds = useAppSelector(selectActiveChainIds);
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
          // first chain unselected should be treated as unselecting all other chains instead
          onChange([id]);
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
