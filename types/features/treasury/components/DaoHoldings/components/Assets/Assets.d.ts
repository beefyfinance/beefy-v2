import type { ChainEntity } from '../../../../../data/entities/chain';
type AssetsProps = {
    chainId: ChainEntity['id'];
};
export declare const Assets: (({ chainId }: AssetsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
