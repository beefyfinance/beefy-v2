import type { VaultEntity } from '../../../../../data/entities/vault';

export type VaultCollapseContentProps = {
  vaultId: VaultEntity['id'];
  address: string;
};

export type ChartTypes = 'positionChart' | 'compoundsChart';
