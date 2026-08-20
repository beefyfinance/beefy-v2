import type { ChainEntity } from '../../../../features/data/entities/chain';
export declare const ChainRpcItem: (({ error, id, onSelect, }: {
    id: ChainEntity["id"];
    onSelect: (id: ChainEntity["id"]) => void;
    error?: boolean;
}) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
