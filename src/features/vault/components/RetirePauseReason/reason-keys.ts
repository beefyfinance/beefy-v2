import type { PauseReason, RetireReason, VaultEntity } from '../../../data/entities/vault.ts';

export type RetirePauseReasonTarget = {
  status: Exclude<VaultEntity['status'], 'active'>;
  reason: RetireReason | PauseReason | undefined;
  /** what users get back after a panic */
  holding: 'lp' | 'single';
  hasReplacement: boolean;
};

type ReasonSentences = {
  /** `Vault-Reason-${cause}` copy key */
  cause: string;
  panic?: true;
  /** one-off event copy: no panic/move sentence */
  specific?: true;
};

const reasonSentences = {
  rewards: { cause: 'rewards' },
  tvl: { cause: 'tvl' },
  upgrade: { cause: 'upgrade' },
  beta: { cause: 'beta' },
  sunset: { cause: 'sunset' },
  sunsetPanic: { cause: 'sunset', panic: true },
  exploitNoPanic: { cause: 'exploit' },
  exploitPanic: { cause: 'exploit', panic: true },
  liquidityNoPanic: { cause: 'liquidity' },
  liquidityPanic: { cause: 'liquidity', panic: true },
  bifiV2: { cause: 'bifiV2', specific: true },
  bevelo: { cause: 'bevelo', specific: true },
  scream: { cause: 'scream', specific: true },
  Balancer2025: { cause: 'Balancer2025', specific: true },
  Stream2025: { cause: 'Stream2025', specific: true },
  AerodromeMigration26: { cause: 'AerodromeMigration26', specific: true },
} as const satisfies Record<RetireReason, ReasonSentences>;

/** i18n keys, one per sentence in display order; inner arrays are i18next fallbacks */
export function getRetirePauseReasonKeys({
  status,
  reason,
  holding,
  hasReplacement,
}: RetirePauseReasonTarget): Array<string | string[]> {
  const keys: Array<string | string[]> = [`Vault-Status-${status}`];
  if (!reason) {
    return keys;
  }

  const sentences: ReasonSentences = reasonSentences[reason];
  keys.push([`Vault-Reason-${sentences.cause}-${status}`, `Vault-Reason-${sentences.cause}`]);
  if (sentences.specific) {
    return keys;
  }
  if (sentences.panic) {
    keys.push(`Vault-Reason-panic-${holding}`);
  }
  if (hasReplacement) {
    keys.push('Vault-Reason-move');
  }
  return keys;
}
