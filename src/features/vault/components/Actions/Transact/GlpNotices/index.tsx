import { memo } from 'react';
import { VaultEntity } from '../../../../../data/entities/vault';
import { GlpDepositNoticeImpl } from './GlpDepositNoticeImpl';
import { GlpWithdrawNoticeImpl } from './GlpWithdrawNoticeImpl';
import { GlpLikeConfig } from './types';

export const enableForVaults: Record<VaultEntity['id'], GlpLikeConfig> = {
  'opx-olp': { managerMethod: 'glpManager' },
  'mvx-mvlp': { managerMethod: 'mvlpManager' },
};

type GlpDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};
export const GlpDepositNotice = memo<GlpDepositNoticeProps>(function GlpDepositNotice({
  vaultId,
  onChange,
}) {
  if (vaultId in enableForVaults) {
    return (
      <GlpDepositNoticeImpl
        vaultId={vaultId}
        config={enableForVaults[vaultId]}
        onChange={onChange}
      />
    );
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
  if (vaultId in enableForVaults) {
    return (
      <GlpWithdrawNoticeImpl
        vaultId={vaultId}
        config={enableForVaults[vaultId]}
        onChange={onChange}
      />
    );
  }

  return null;
});
