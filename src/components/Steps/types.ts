import BigNumber from 'bignumber.js';
import { ThunkAction } from 'redux-thunk';

export type Step = {
  step: string; // "stake"| "unstake" | "deposit"|"withdraw" | "claim-unstake"
  message: string;
  action: ThunkAction<any, any, any, any>;
  pending: boolean;
};
/*| {
      step: 'withdraw' | 'unstake' | 'claim-unstake' | 'stake';
      message: string;
      action: ThunkAction<any, any, any, any>;
      pending: boolean;
      amount: BigNumber;
      token: {
        symbol: string;
        decimals: number;
      };
    };*/

export interface StepperState {
  modal: boolean;
  currentStep: number;
  items: Step[];
  finished: boolean;
}
