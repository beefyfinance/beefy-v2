import { isTokenErc20 } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { selectVaultPlatformOrUndefined } from './platforms.ts';
import { selectVaultAssetTokensOrUndefined } from './tokens.ts';
import { selectVaultById } from './vaults.ts';
import { isDefined } from '../utils/array-utils.ts';
import { createSelector } from '@reduxjs/toolkit';
import type { Token } from '@beefyfinance/blockchain-addressbook';

export type RiskKeys = Exclude<keyof VaultEntity['risks'], 'updatedAt'>;
export type RiskChange = { key: RiskKeys; value: boolean };
type TokenTag = Exclude<Token['tags'], undefined>[number];
type TokenTagToRiskMap = { [K in TokenTag]?: RiskChange };

export const platformRiskMap: Record<string, RiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
  HIGHLY_COMPLEX: { key: 'complex', value: true },
  NOT_BATTLE_TESTED: { key: 'notBattleTested', value: true },
};

export const tokenTagToRiskMap: Record<string, RiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
  SYNTHETIC: { key: 'synthAsset', value: true },
  CURATED: { key: 'curated', value: true },
} satisfies TokenTagToRiskMap;

const selectVaultRisks = createSelector(
  selectVaultById,
  selectVaultPlatformOrUndefined,
  selectVaultAssetTokensOrUndefined,
  (vault, platform, tokens) => {
    if (
      (!platform || !platform.risks || platform.risks.length === 0) &&
      (!tokens || tokens.length === 0)
    ) {
      return vault.risks;
    }

    const platformRisks =
      platform?.risks
        .map(k => platformRiskMap[k])
        .filter(change => change !== undefined && vault.risks[change.key] !== change.value) || [];
    const tokenRisks =
      tokens
        ?.filter(isDefined)
        .filter(isTokenErc20)
        .flatMap(token => token.tags ?? [])
        .map(k => tokenTagToRiskMap[k])
        .filter(change => change !== undefined && vault.risks[change.key] !== change.value) || [];
    if (platformRisks.length === 0 && tokenRisks.length === 0) {
      return vault.risks;
    }

    const risks = { ...vault.risks };
    for (const change of platformRisks) {
      risks[change.key] = change.value;
    }
    for (const change of tokenRisks) {
      risks[change.key] = change.value;
    }
    return risks;
  }
);

export const selectVaultRiskChecklist = createSelector(selectVaultRisks, risks => {
  const { passed, failed } = Object.entries(risks).reduce(
    (acc, [key, value]) => {
      if (key === 'updatedAt') {
        return acc;
      }
      if (value) {
        acc.failed.push(key);
      } else {
        acc.passed.push(key);
      }
      return acc;
    },
    { passed: [] as string[], failed: [] as string[] }
  );

  return {
    updatedAt: risks.updatedAt,
    passed,
    failed,
  };
});
