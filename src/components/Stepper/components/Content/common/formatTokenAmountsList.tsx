import type BigNumber from 'bignumber.js';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { ListJoin } from '../../../../ListJoin.tsx';

export function formatTokenAmountsList(
  items: { amount: BigNumber; token: { decimals: number; symbol: string } }[]
) {
  return (
    <ListJoin
      items={items.map(
        item =>
          `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${item.token.symbol}`
      )}
    />
  );
}
