import type BigNumber from 'bignumber.js';
import type { VaultEntity } from '../../../../../data/entities/vault';
type WithdrawBoostNoticeProps = {
    vaultId: VaultEntity['id'];
    balance: BigNumber;
};
declare const WithdrawBoostNotice: (({ vaultId, balance, }: WithdrawBoostNoticeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default WithdrawBoostNotice;
