import type { ChainEntity } from '../../../../features/data/entities/chain';
type AddToWalletButtonProps = {
    title: string;
    tokenAddress: string;
    customIconUrl: string;
    chainId: ChainEntity['id'];
};
export declare const AddToWalletButton: import("react").NamedExoticComponent<AddToWalletButtonProps>;
export {};
