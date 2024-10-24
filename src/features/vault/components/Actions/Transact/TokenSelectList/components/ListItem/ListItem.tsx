import { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatTokenDisplayCondensed } from '../../../../../../../../helpers/format';
import type { ChainEntity } from '../../../../../../../data/entities/chain';
import clsx from 'clsx';
import type { TokenEntity } from '../../../../../../../data/entities/token';
import type BigNumber from 'bignumber.js';
import { ChevronRight } from '@material-ui/icons';
import { TokensImage } from '../../../../../../../../components/TokenImage/TokenImage';
import { ListJoin } from '../../../../../../../../components/ListJoin';
import {
  isCowcentratedLikeVault,
  type VaultEntity,
} from '../../../../../../../data/entities/vault';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  selectionId: string;
  tokens: TokenEntity[];
  balance?: BigNumber;
  decimals: number;
  chainId: ChainEntity['id'];
  onSelect: (id: string) => void;
  className?: string;
  index: number;
  vault: VaultEntity;
  isWithdraw?: boolean;
};
export const ListItem = memo<ListItemProps>(function ListItem({
  selectionId,
  tokens,
  decimals,
  balance,
  className,
  onSelect,
  index,
  vault,
  isWithdraw = false,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const tokenSymbols = useMemo(() => tokens.map(token => token.symbol), [tokens]);
  const isLp = useMemo(() => {
    return vault.assetIds.length > 1
      ? isCowcentratedLikeVault(vault)
        ? index === 0
          ? true
          : //clm vaults accepts rCLM and we want to show it as LP
          index === 1 && tokenSymbols.length === 1
          ? true
          : false
        : index === 0
        ? true
        : false
      : false;
  }, [index, tokenSymbols.length, vault]);

  return (
    <button className={clsx(classes.item, className)} onClick={handleClick}>
      <TokensImage tokens={tokens} className={classes.icon} />
      <div className={classes.symbol}>
        <ListJoin items={tokenSymbols} />
        {isLp ? (
          isWithdraw && isCowcentratedLikeVault(vault) ? null : (
            <div className={classes.lp}>
              {isCowcentratedLikeVault(vault)
                ? tokenSymbols[0].includes('rCLM')
                  ? 'rCLM'
                  : 'CLM'
                : 'LP'}
            </div>
          )
        ) : null}
      </div>
      {balance ? (
        <div className={classes.balance}>{formatTokenDisplayCondensed(balance, decimals, 8)}</div>
      ) : null}
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
