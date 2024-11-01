import { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatTokenDisplayCondensed } from '../../../../../../../../helpers/format';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import clsx from 'clsx';
import type { TokenEntity } from '../../../../../../../data/entities/token';
import type BigNumber from 'bignumber.js';
import { TokensImage } from '../../../../../../../../components/TokenImage/TokenImage';
import { ListJoin } from '../../../../../../../../components/ListJoin';
import { ReactComponent as ChevronRight } from '../../../../../../../../images/icons/chevron-right.svg';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  selectionId: string;
  tokens: TokenEntity[];
  balance?: BigNumber;
  decimals: number;
  chainId: ChainEntity['id'];
  onSelect: (id: string) => void;
  className?: string;
  tag?: string;
};
export const ListItem = memo<ListItemProps>(function ListItem({
  selectionId,
  tokens,
  decimals,
  balance,
  className,
  onSelect,
  tag,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const tokenSymbols = useMemo(() => tokens.map(token => token.symbol), [tokens]);

  return (
    <button className={clsx(classes.item, className)} onClick={handleClick}>
      <div className={clsx(classes.side)}>
        <TokensImage tokens={tokens} className={classes.icon} />
        <div className={classes.symbol}>
          <ListJoin items={tokenSymbols} />
        </div>
        {tag ? <div className={classes.tag}>{tag}</div> : null}
      </div>
      <div className={clsx(classes.side, classes.right)}>
        {balance ? (
          <div className={classes.balance}>{formatTokenDisplayCondensed(balance, decimals, 8)}</div>
        ) : null}
        <ChevronRight className={classes.arrow} />
      </div>
    </button>
  );
});
