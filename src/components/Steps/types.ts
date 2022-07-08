import { ThunkAction } from 'redux-thunk';

export type Step = {
  step:
    | 'approve'
    | 'stake'
    | 'unstake'
    | 'deposit'
    | 'withdraw'
    | 'claim-unstake'
    | 'claim-withdraw'
    | 'claim-boost'
    | 'claim-gov'
    | 'mint'
    | 'burn'
    | 'bridge';
  message: string;
  action: ThunkAction<any, any, any, any>;
  pending: boolean;
};

export interface StepperState {
  modal: boolean;
  currentStep: number;
  items: Step[];
  finished: boolean;
}
