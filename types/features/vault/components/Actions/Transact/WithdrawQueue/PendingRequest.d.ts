import type { VaultErc4626 } from '../../../../../data/entities/vault';
import type { TokenErc20 } from '../../../../../data/entities/token';
import type BigNumber from 'bignumber.js';
import type { Erc4626PendingBalanceRequest } from '../../../../../data/apis/balance/balance-types';
type PendingRequestProps = {
    vaultId: VaultErc4626['id'];
    chainId: VaultErc4626['chainId'];
    depositToken: TokenErc20;
    depositTokenPrice: BigNumber;
    request: Erc4626PendingBalanceRequest;
    onWithdraw: (id: bigint) => void;
    withdrawDisabled?: boolean;
};
export declare const PendingRequest: (({ depositToken, depositTokenPrice, request, onWithdraw, withdrawDisabled, }: PendingRequestProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
