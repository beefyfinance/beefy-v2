import type { TenderlySimulateResponse, TenderlySimulateResponseContract } from '../../../features/data/apis/tenderly/types';
import { StackEntry } from './StackEntry';
export declare class TenderlySimulateResponseProcessor {
    protected response: TenderlySimulateResponse;
    private readonly contracts;
    constructor(response: TenderlySimulateResponse);
    getReverts(): {
        error: string;
        stack: StackEntry[];
    }[] | undefined;
    protected getContracts(contracts: TenderlySimulateResponseContract[]): Record<string, TenderlySimulateResponseContract>;
}
