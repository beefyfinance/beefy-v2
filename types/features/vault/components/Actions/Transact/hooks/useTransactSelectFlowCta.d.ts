/**
 * Same navigation as TokenSelectButton: cross-chain + forceSelection → chain select, else token select.
 * Deposit-from-vault mode mirrors the cross-chain flow: with no source vault picked, the CTA opens the
 * vault-select step and reads "Select vault". Once a vault is picked, the caller falls back to the normal
 * disabled/deposit states (ActionConnectSwitch handles "Switch to {chain}").
 * Label mirrors DepositForm / WithdrawForm header logic.
 * Deposit/withdraw actions skip the network switch CTA while selecting (see ActionConnectSwitch chainId).
 */
export declare function useTransactSelectFlowCta(): {
    ctaLabel: string;
    openSelectStep: () => void;
    isSelecting: boolean;
};
