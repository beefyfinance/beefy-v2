import type { Namespace, TFunction } from 'react-i18next';
import { type TransactQuote } from '../../apis/transact/transact-types';
import type { VaultGov } from '../../entities/vault';
import type { Step } from '../../reducers/wallet/stepper-types';
import type { BeefyStateFn, BeefyThunk } from '../../store/types';
export declare function getTransactSteps(quote: TransactQuote, t: TFunction<Namespace>, getState: BeefyStateFn): Promise<Step[]>;
/**
 * Steps to deposit into or withdraw from a vault
 * Builds allowance steps from quote data,
 * then asks quote provider for the deposit/withdraw step,
 * which is wrapped to provide quote recheck/confirm functionality
 */
export declare function transactSteps(quote: TransactQuote, t: TFunction<Namespace>): BeefyThunk;
/**
 * Special steps builder for gov (earnings) vault claim button
 */
export declare function transactStepsClaimGov(vault: VaultGov, t: TFunction<Namespace>): BeefyThunk;
