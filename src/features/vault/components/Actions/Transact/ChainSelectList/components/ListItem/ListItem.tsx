import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import clsx from 'clsx';
import { ChevronRight } from '@material-ui/icons';
import { ChainIcon } from '../../../../../../../bridge/components/Bridge/components/ChainIcon';
import { useAppSelector } from '../../../../../../../../store';
import { selectChainById } from '../../../../../../../data/selectors/chains';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  chainId: ChainEntity['id'];
  onSelect: (id: ChainEntity['id']) => void;
  /** currently selected chain */
  selected: boolean;
  /** chain is native to the vault */
  native: boolean;
  className?: string;
};
export const ListItem = memo<ListItemProps>(function ListItem({
  chainId,
  className,
  onSelect,
  selected,
  native,
}) {
  const classes = useStyles();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => onSelect(chainId), [onSelect, chainId]);

  return (
    <button
      className={clsx(classes.item, className, {
        [classes.selected]: selected,
        [classes.native]: native,
      })}
      onClick={handleClick}
    >
      <ChainIcon chainId={chainId} className={classes.icon} />
      <div className={classes.name}>{chain.name}</div>
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
