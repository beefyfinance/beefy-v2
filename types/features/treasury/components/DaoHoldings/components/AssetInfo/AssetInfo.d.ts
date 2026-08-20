import type { ChainEntity } from '../../../../../data/entities/chain';
import { type TreasuryHoldingEntity } from '../../../../../data/entities/treasury';
interface AssetInfoProps {
    chainId: ChainEntity['id'];
    token: TreasuryHoldingEntity;
}
export declare const AssetInfo: (({ chainId, token }: AssetInfoProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
