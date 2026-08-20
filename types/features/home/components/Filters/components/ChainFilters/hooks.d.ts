import { type FC, type SVGProps } from 'react';
import type { ChainEntity } from '../../../../../data/entities/chain';
export declare function useSelectedChainIds(): ChainEntity['id'][];
export declare function getNetworkIcon(chainId: ChainEntity['id']): FC<SVGProps<SVGSVGElement>>;
