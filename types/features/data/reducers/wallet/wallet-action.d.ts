import { type WalletActionsState } from './wallet-action-types';
export declare const walletActionsReducer: (state: WalletActionsState | undefined, action: {
    type: "WALLET_ACTION" | "WALLET_ACTION_RESET";
    payload: WalletActionsState;
}) => WalletActionsState;
