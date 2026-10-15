import type { Namespace, TFunction } from 'react-i18next';
import { isZapQuoteStepUnstake } from '../../apis/transact/transact-types.ts';
import type { BoostPromoEntity } from '../../entities/promo.ts';
import type { Step } from '../../reducers/wallet/stepper-types.ts';
import type { PendingCrossChainOp } from '../../reducers/wallet/transact-types.ts';

/** Boosted zaps name the stake/unstake in the wallet prompt and success screen */
export function withBoostDetails(
  step: Step,
  t: TFunction<Namespace>,
  boostId: BoostPromoEntity['id'] | undefined,
  boostClaimed = false
): Step {
  if (!boostId || (step.step !== 'zap-in' && step.step !== 'zap-out')) {
    return step;
  }
  return {
    ...step,
    message: t('Vault-TxnConfirm', {
      type: t(step.step === 'zap-in' ? 'Deposit-Boost-noun' : 'Unstake-Withdraw-noun'),
    }),
    extraInfo: { ...step.extraInfo, boostId, ...(boostClaimed && { boostClaimed }) },
  };
}

/** A deposit's recovery tx is the one that stakes; a withdraw already unstaked in its source tx */
export function withRecoveryBoostDetails(
  step: Step,
  op: PendingCrossChainOp,
  t: TFunction<Namespace>
): Step {
  if (op.direction === 'deposit') {
    const boostId = op.recovery.destHandlerKind === 'vault' ? op.recovery.boostId : undefined;
    return withBoostDetails(step, t, boostId);
  }
  const boostId = op.sourceDisplaySteps.find(isZapQuoteStepUnstake)?.boostId;
  return boostId ? { ...step, extraInfo: { ...step.extraInfo, boostId } } : step;
}
