import { memo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { GlpDepositNoticeImpl } from './GlpDepositNoticeImpl';
import { GlpWithdrawNoticeImpl } from './GlpWithdrawNoticeImpl';

export const enableForVaults: VaultEntity['id'][] = ['gmx-arb-glp', 'gmx-avax-glp'];

type GlpDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};
export const GlpDepositNotice = memo<GlpDepositNoticeProps>(function GlpDepositNotice({
  vaultId,
  onChange,
}) {
  if (enableForVaults.includes(vaultId)) {
    return <GlpDepositNoticeImpl vaultId={vaultId} onChange={onChange} />;
  }

  return null;
});

type GlpWithdrawNoticeProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};
export const GlpWithdrawNotice = memo<GlpWithdrawNoticeProps>(function GlpWithdrawNotice({
  vaultId,
  onChange,
}) {
  if (enableForVaults.includes(vaultId)) {
    return <GlpWithdrawNoticeImpl vaultId={vaultId} onChange={onChange} />;
  }

  return null;
});
