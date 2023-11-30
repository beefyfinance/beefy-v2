import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../../../../../helpers/format';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import clsx from 'clsx';
import type { TokenEntity } from '../../../../../../../data/entities/token';
import type BigNumber from 'bignumber.js';
import { ChevronRight } from '@material-ui/icons';
import { TokensImage } from '../../../../../../../../components/TokenImage/TokenImage';
import { ListJoin } from '../../../../../../../../components/ListJoin';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  selectionId: string;
  tokens: TokenEntity[];
  balance?: BigNumber;
  chainId: ChainEntity['id'];
  onSelect: (id: string) => void;
  className?: string;
};
export const ListItem = memo<ListItemProps>(function ListItem({
  selectionId,
  tokens,
  balance,
  className,
  onSelect,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const tokenSymbols = useMemo(() => tokens.map(token => token.symbol), [tokens]);

  return (
    <button className={clsx(classes.item, className)} onClick={handleClick}>
      <TokensImage tokens={tokens} className={classes.icon} />
      <div className={classes.symbol}>
        <ListJoin items={tokenSymbols} />
      </div>
      {balance ? <div className={classes.balance}>{formatBigDecimals(balance, 4)}</div> : null}
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
