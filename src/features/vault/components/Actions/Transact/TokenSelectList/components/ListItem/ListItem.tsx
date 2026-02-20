import { memo, useCallback, useMemo } from 'react';
import { formatTokenDisplayCondensed } from '../../../../../../../../helpers/format.ts';
import type { ChainEntity } from '../../../../../../../data/entities/chain.ts';
import { css, type CssStyles, cx } from '@repo/styles/css';
import type { TokenEntity } from '../../../../../../../data/entities/token.ts';
import type BigNumber from 'bignumber.js';
import { TokensImage } from '../../../../../../../../components/TokenImage/TokenImage.tsx';
import { ListJoin } from '../../../../../../../../components/ListJoin.tsx';
import ChevronRight from '../../../../../../../../images/icons/chevron-right.svg?react';
import {
  ListItemBalance,
  ListItemButton,
  ListItemName,
  ListItemRightSide,
  ListItemSide,
  ListItemTag,
} from '../../../common/CommonListStyles.tsx';
import { listItemArrow } from '../../../common/CommonListStylesRaw.ts';

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
  const handleClick = useCallback(() => onSelect(selectionId), [onSelect, selectionId]);
  const tokenSymbols = useMemo(() => tokens.map(token => token.symbol), [tokens]);

  return (
    <ListItemButton type="button" css={cssProp} onClick={handleClick}>
      <ListItemSide>
        <TokensImage tokens={tokens} size={24} />
        <ListItemName>
          <ListJoin items={tokenSymbols} />
        </ListItemName>
        {tag ?
          <ListItemTag>{tag}</ListItemTag>
        : null}
      </ListItemSide>
      <ListItemRightSide>
        {balance ?
          <ListItemBalance>{formatTokenDisplayCondensed(balance, decimals, 8)}</ListItemBalance>
        : null}
        <ChevronRight className={cx('list-item-arrow', css(listItemArrow))} />
      </ListItemRightSide>
    </ListItemButton>
  );
});
