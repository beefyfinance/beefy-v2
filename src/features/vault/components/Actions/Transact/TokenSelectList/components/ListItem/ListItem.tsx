import { memo, useCallback, useMemo } from 'react';
import { legacyMakeStyles } from '../../../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { formatTokenDisplayCondensed } from '../../../../../../../../helpers/format.ts';
import type { ChainEntity } from '../../../../../../../data/entities/chain.ts';
import { css, type CssStyles, cx } from '@repo/styles/css';
import type { TokenEntity } from '../../../../../../../data/entities/token.ts';
import type BigNumber from 'bignumber.js';
import { TokensImage } from '../../../../../../../../components/TokenImage/TokenImage.tsx';
import { ListJoin } from '../../../../../../../../components/ListJoin.tsx';
import ChevronRight from '../../../../../../../../images/icons/chevron-right.svg?react';

const useStyles = legacyMakeStyles(styles);

export type ListItemProps = {
  selectionId: string;
  tokens: TokenEntity[];
  balance?: BigNumber;
  decimals: number;
  chainId: ChainEntity['id'];
  onSelect: (id: string) => void;
  css?: CssStyles;
  tag?: string;
};
export const ListItem = memo(function ListItem({
  selectionId,
  tokens,
  decimals,
  balance,
  css: cssProp,
  onSelect,
  tag,
}: ListItemProps) {
  const classes = useStyles();
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const tokenSymbols = useMemo(() => tokens.map(token => token.symbol), [tokens]);

  return (
    <button type="button" className={css(styles.item, cssProp)} onClick={handleClick}>
      <div className={css(styles.side)}>
        <TokensImage tokens={tokens} css={styles.icon} />
        <div className={classes.symbol}>
          <ListJoin items={tokenSymbols} />
        </div>
        {tag ?
          <div className={classes.tag}>{tag}</div>
        : null}
      </div>
      <div className={css(styles.side, styles.right)}>
        {balance ?
          <div className={classes.balance}>{formatTokenDisplayCondensed(balance, decimals, 8)}</div>
        : null}
        <ChevronRight className={cx('item-arrow', classes.arrow)} />
      </div>
    </button>
  );
});
