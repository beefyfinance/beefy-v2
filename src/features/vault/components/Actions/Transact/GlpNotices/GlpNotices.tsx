import { memo } from 'react';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { GlpDepositNoticeImpl } from './GlpDepositNoticeImpl.tsx';
import { GlpWithdrawNoticeImpl } from './GlpWithdrawNoticeImpl.tsx';
import type { GlpLikeConfig } from './types.ts';

const enableForVaults: Record<VaultEntity['id'], GlpLikeConfig> = {
  'opx-olp': { managerMethod: 'glpManager' },
  'mvx-mvlp': { managerMethod: 'mvlpManager' },
  'kinetix-klp': { managerMethod: 'klpManager' },
};

type GlpDepositNoticeProps = {
  vaultId: VaultEntity['id'];
  onChange: (isLocked: boolean) => void;
};
export const GlpDepositNotice = memo(function GlpDepositNotice({
  vaultId,
  onChange,
}: GlpDepositNoticeProps) {
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
export const GlpWithdrawNotice = memo(function GlpWithdrawNotice({
  vaultId,
  onChange,
}: GlpWithdrawNoticeProps) {
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
