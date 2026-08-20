import type { ChainEntity } from '../../../../features/data/entities/chain';
export declare const Icon: import("@repo/styles/jsx").StyledComponent<"img", {
    first?: boolean | undefined;
    price?: boolean | undefined;
}>;
export declare const ChainSquareIcon: ({ chainId, }: {
    chainId: ChainEntity["id"];
}) => import("react/jsx-runtime").JSX.Element;
