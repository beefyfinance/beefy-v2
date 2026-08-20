import type { ChainEntity } from '../../../../../data/entities/chain';
export type ChainButtonSelectorProps = {
    selected: ChainEntity['id'][];
    onChange: (selected: ChainEntity['id'][]) => void;
};
export declare const ChainButtonSelector: (({ selected, onChange, }: ChainButtonSelectorProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
