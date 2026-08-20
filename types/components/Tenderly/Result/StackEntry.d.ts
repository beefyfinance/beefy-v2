import type { TenderlyCallTrace, TenderlySimulateResponseContract } from '../../../features/data/apis/tenderly/types';
export declare class StackEntry {
    readonly id: string;
    protected trace: TenderlyCallTrace;
    protected contracts: Record<string, TenderlySimulateResponseContract>;
    constructor(id: string, trace: TenderlyCallTrace, contracts: Record<string, TenderlySimulateResponseContract>);
    get errorReason(): string | undefined;
    protected getSourceFrom(contractAddress: string, code_length: number, code_start: number, file_index: number): {
        prev: string;
        source: string;
        next: string;
    } | undefined;
    getErrorSource(): {
        prev: string;
        source: string;
        next: string;
    } | undefined;
    get isRevert(): boolean;
    getDetails(): {
        type: "other" | "call" | "unknown" | "revert" | "delegatecall" | "jumpdest";
        typeLabel: string;
        to: string;
        toLabel: string | undefined;
        func: string | undefined;
        funcLabel: string;
        input: string | undefined;
        inputLabels: {
            [k: string]: unknown;
        } | undefined;
        output: string | undefined;
        outputLabels: {
            [k: string]: unknown;
        } | undefined;
    };
    getType(): StackEntryType;
}
type StackEntryType = {
    type: 'revert' | 'call' | 'delegatecall' | 'jumpdest' | 'unknown' | 'other';
    label: string;
};
export {};
