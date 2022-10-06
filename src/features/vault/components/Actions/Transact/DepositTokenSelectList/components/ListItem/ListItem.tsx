import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { formatBigDecimals } from '../../../../../../../../helpers/format';
import { ChainEntity } from '../../../../../../../data/entities/chain';
import { AssetsImage } from '../../../../../../../../components/AssetsImage';
import clsx from 'clsx';
import { TokenEntity } from '../../../../../../../data/entities/token';
import BigNumber from 'bignumber.js';
import { ChevronRight } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type ListItemProps = {
  tokenId: string;
  token: TokenEntity;
  balance: BigNumber;
  chainId: ChainEntity['id'];
  vaultAssets: string[];
  depositTokenAddress: string;
  onSelect: (id: string) => void;
  className?: string;
};
export const ListItem = memo<ListItemProps>(function ({
  tokenId,
  token,
  balance,
  chainId,
  vaultAssets,
  depositTokenAddress,
  className,
  onSelect,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => onSelect(tokenId), [onSelect, tokenId]);

  return (
    <button className={clsx(classes.item, className)} onClick={handleClick}>
      <AssetsImage
        className={classes.icon}
        chainId={chainId}
        assetIds={
          token.address.toLowerCase() === depositTokenAddress.toLowerCase()
            ? vaultAssets
            : [token.symbol]
        }
      />
      <div className={classes.symbol}>{token.symbol}</div>
      <div className={classes.balance}>{formatBigDecimals(balance, 4)}</div>
      <ChevronRight className={classes.arrow} />
    </button>
  );
});
