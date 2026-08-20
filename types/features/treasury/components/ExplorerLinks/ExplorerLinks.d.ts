import type { ChainEntity } from '../../../data/entities/chain';
interface ExplorerLinkProps {
    chainId: ChainEntity['id'];
}
export declare const ExplorerLinks: (({ chainId }: ExplorerLinkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
