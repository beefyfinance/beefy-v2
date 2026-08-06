import { type FC, type SVGProps } from 'react';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';

const networkIcons = import.meta.glob<FC<SVGProps<SVGSVGElement>>>(
  '../../../../../../images/networks/*.svg',
  {
    eager: true,
    import: 'default',
    query: '?react',
  }
);

export function getNetworkIcon(chainId: ChainEntity['id']): FC<SVGProps<SVGSVGElement>> {
  return networkIcons[`../../../../../../images/networks/${chainId}.svg`];
}
