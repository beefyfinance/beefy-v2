import type BigNumber from 'bignumber.js';
import type { ReactNode } from 'react';
import { formatTokenDisplayCondensed } from '../../../../../helpers/format.ts';
import { ListJoin } from '../../../../ListJoin.tsx';

type ChainGroupedTokensProps = {
  items: { amount: BigNumber; token: { decimals: number; symbol: string }; chainName: string }[];
};

export function ChainGroupedTokens({ items }: ChainGroupedTokensProps) {
  const byChain = new Map<string, typeof items>();
  for (const item of items) {
    const group = byChain.get(item.chainName);
    if (group) {
      group.push(item);
    } else {
      byChain.set(item.chainName, [item]);
    }
  }

  const groups: ReactNode[] = [];
  for (const [chainName, chainItems] of byChain) {
    const tokenLabels = chainItems.map(
      item =>
        `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${item.token.symbol}`
    );
    groups.push(
      <>
        <ListJoin items={tokenLabels} /> on {chainName}
      </>
    );
  }

  if (groups.length === 1) {
    return <>{groups[0]}</>;
  }

  return (
    <>
      {groups.reduce<ReactNode>(
        (acc, group, i) =>
          i === 0 ? group : (
            <>
              {acc}, and {group}
            </>
          ),
        null
      )}
    </>
  );
}
