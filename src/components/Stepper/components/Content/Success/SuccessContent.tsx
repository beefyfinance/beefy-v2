import { type FC, memo } from 'react';
import type { Step } from '../../../../../features/data/reducers/wallet/stepper-types.ts';
import { selectStepperCurrentStepData } from '../../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../../features/data/store/hooks.ts';
import { BoostStakeSuccessContent } from './BoostStakeSuccessContent.tsx';
import { BoostUnstakeSuccessContent } from './BoostUnstakeSuccessContent.tsx';
import { BridgeSuccessContent } from './BridgeSuccessContent.tsx';
import { FallbackSuccessContent } from './FallbackSuccessContent.tsx';
import { MintSuccessContent } from './MintSuccessContent.tsx';
import type { SuccessContentProps } from './types.ts';
import { ZapSuccessContent } from './ZapSuccessContent.tsx';

type StepToSuccessContent = {
  [key in Step['step']]?: FC<SuccessContentProps>;
};

const stepToSuccessContent: StepToSuccessContent = {
  'zap-in': ZapSuccessContent,
  'zap-out': ZapSuccessContent,
  mint: MintSuccessContent,
  bridge: BridgeSuccessContent,
  'boost-stake': BoostStakeSuccessContent,
  'boost-unstake': BoostUnstakeSuccessContent,
  'boost-claim-unstake': BoostUnstakeSuccessContent,
  'boost-claim': BoostUnstakeSuccessContent,
};

export const SuccessContent = memo(function SuccessContent() {
  const step = useAppSelector(selectStepperCurrentStepData);
  const Component = stepToSuccessContent[step.step] || FallbackSuccessContent;
  return <Component step={step} />;
});
