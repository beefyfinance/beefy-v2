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
export type TokenTagRiskKeys = 'largeHolders';
export type TokenRiskKeys = RiskKeys | TokenTagRiskKeys;
export type TokenRiskChange = { key: TokenRiskKeys; value: boolean };
type TokenTags = Exclude<Token['tags'], undefined>[number];
export type TokenOnlyTags = Extract<
  TokenTags,
  'LARGE_HOLDERS' | 'NO_TIMELOCK' | 'SYNTHETIC' | 'CURATED'
>;
type TokenTagToRiskMap = { [K in TokenTags]?: TokenRiskChange };

export const platformRiskMap: Record<string, RiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
  HIGHLY_COMPLEX: { key: 'complex', value: true },
  NOT_BATTLE_TESTED: { key: 'notBattleTested', value: true },
};

export const tokenTagToRiskMap: Record<string, TokenRiskChange> = {
  NO_TIMELOCK: { key: 'notTimelocked', value: true },
  SYNTHETIC: { key: 'synthAsset', value: true },
  CURATED: { key: 'curated', value: true },
  LARGE_HOLDERS: { key: 'largeHolders', value: true },
} satisfies TokenTagToRiskMap;

const selectVaultRisks = createSelector(
  selectVaultById,
  selectVaultPlatformOrUndefined,
  selectVaultAssetTokensOrUndefined,
  (vault, platform, tokens) => {
    const risks: VaultEntity['risks'] & Record<TokenTagRiskKeys, boolean> = {
      ...vault.risks,
      largeHolders: false,
    };
    const platformRisks =
      platform?.risks
        .map(k => platformRiskMap[k])
        .filter(change => change !== undefined && risks[change.key] !== change.value) || [];
    const tokenRisks =
      tokens
        ?.filter(isDefined)
        .filter(isTokenErc20)
        .flatMap(token => token.tags ?? [])
        .map(k => tokenTagToRiskMap[k])
        .filter(change => change !== undefined && risks[change.key] !== change.value) || [];

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
