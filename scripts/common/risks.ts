import type { VaultRisksConfig } from '../../src/features/data/apis/config-types.ts';

export type RiskKeys = keyof {
  [K in keyof VaultRisksConfig as VaultRisksConfig[K] extends boolean ? K : never]: true;
};

type RisksToType = {
  [K in keyof VaultRisksConfig]-?: K extends RiskKeys ? ['boolean']
  : VaultRisksConfig[K] extends number | undefined ? ['number', 'undefined']
  : never;
};

const risksToTypeMap: Record<string, string[]> = {
  updatedAt: ['number', 'undefined'],
  synthAsset: ['boolean'],
  complex: ['boolean'],
  curated: ['boolean'],
  notCorrelated: ['boolean'],
  notAudited: ['boolean'],
  notBattleTested: ['boolean'],
  notTimelocked: ['boolean'],
  notVerified: ['boolean'],
} satisfies RisksToType;

export const riskKeys = Object.keys(risksToTypeMap).filter(
  key => key !== 'updatedAt'
) as RiskKeys[];

export function isValidRisksConfig(risks: Record<string, unknown>): risks is VaultRisksConfig {
  const keys = new Set(Object.keys(risks));
  for (const [key, expectedTypes] of Object.entries(risksToTypeMap)) {
    const value = risks[key];
    const valueType = typeof value;
    if (!expectedTypes.includes(valueType)) {
      return false;
    }
    keys.delete(key);
  }
  return keys.size === 0;
}

export function getRisksConfigErrors(risks: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const keys = new Set(Object.keys(risks));
  for (const [key, expectedTypes] of Object.entries(risksToTypeMap)) {
    const value = risks[key];
    const valueType = typeof value;
    if (!expectedTypes.includes(valueType)) {
      errors.push(`${key}: expected one of [${expectedTypes.join(', ')}], got ${valueType}`);
    }
    keys.delete(key);
  }
  for (const extraKey of keys) {
    errors.push(`${extraKey}: unexpected key`);
  }
  return errors;
}
