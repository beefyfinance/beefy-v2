import type { Address } from 'viem';
import type { ChainId } from '../../entities/chain';
import { type Abi, type PublicClient, type WalletClient } from 'viem';
export declare const fetchContract: <TAbi extends Abi>(address: string, abi: TAbi, chainId: ChainId, withMulticall?: boolean) => ((import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string> extends true ? unknown : {
    read: { [functionName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : never : never) => Promise<import("viem").ContractFunctionReturnType<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>> : (...parameters: [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] | [args: readonly unknown[], options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined]) => Promise<import("viem").ReadContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_1 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    simulate: { [functionName_2 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | Address | undefined = undefined>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : never : never) => Promise<import("viem").SimulateContractReturnType<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, undefined, chainOverride, accountOverride>> : <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride_1 extends import("viem").Account | Address | undefined = undefined>(...parameters: [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined] | [args: readonly unknown[], options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined]) => Promise<import("viem").SimulateContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string> extends true ? unknown : {
    createEventFilter: { [EventName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <const args extends import("viem").MaybeExtractEventArgsFromAbi<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never> | undefined, strict extends boolean | undefined = undefined>(...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never) & {
        strict?: strict | undefined;
    }) | undefined] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | (import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> extends infer T_4 ? T_4 extends import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> ? T_4 extends args ? Readonly<args> : never : never : never), options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_5 ? { [K_2 in keyof T_5]: T_5[K_2]; } : never) & {
        strict?: strict | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never, args, strict>> : <strict_1 extends boolean | undefined = undefined>(...parameters: [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        strict?: undefined;
        toBlock?: undefined;
        args?: undefined;
    }, options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_4 ? { [K_2 in keyof T_4]: T_4[K_2]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType> : never : never; };
    getEvents: { [EventName_1 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] : [args?: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : (...parameters: [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] | [args?: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    } | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : never : never; };
    watchEvent: { [EventName_2 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_3 ? T_3 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_3 extends import("viem").ContractEventName<TAbi> ? T_3 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }>, options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_4 ? T_4 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_4 extends import("viem").ContractEventName<TAbi> ? T_4 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }]) => import("viem").WatchContractEventReturnType : (...parameters: [options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_3 ? T_3 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_3 extends import("viem").ContractEventName<TAbi> ? T_3 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    }, options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_4 ? T_4 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_4 extends import("viem").ContractEventName<TAbi> ? T_4 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined]) => import("viem").WatchContractEventReturnType : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_3 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    write: { [functionName_4 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <chainOverride extends import("viem").Chain | undefined, options extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_5 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_5]: import("abitype").AbiParameterToPrimitiveType<T_5[key_1], abiParameterKind>; } : never) extends infer T_4 ? { [key in keyof T_4]: T_4[key]; } : never) extends infer T_6 ? T_6 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_10 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_10]: import("abitype").AbiParameterToPrimitiveType<T_10[key_1], abiParameterKind>; } : never) extends infer T_9 ? { [key in keyof T_9]: T_9[key]; } : never) ? T_6 extends readonly [] ? [options: options] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_8 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_8]: import("abitype").AbiParameterToPrimitiveType<T_8[key_1], abiParameterKind>; } : never) extends infer T_7 ? { [key in keyof T_7]: T_7[key]; } : never, options: options] : never : never) => Promise<import("viem").WriteContractReturnType> : <chainOverride extends import("viem").Chain | undefined, options_1 extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never, Rest extends unknown[] = [options: options_1]>(...parameters: Rest | [args: readonly unknown[], ...parameters: Rest]) => Promise<import("viem").WriteContractReturnType> : never : never; };
}) extends infer T_1 ? { [K_1 in keyof T_1]: T_1[K_1]; } : never) & {
    address: `0x${string}`;
    abi: TAbi;
} extends infer T ? { [K in keyof T]: T[K]; } : never;
export declare const fetchWalletContract: <TAbi extends Abi>(address: string, abi: TAbi, walletClient: WalletClient, publicClient?: PublicClient) => (((import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string> extends true ? unknown : {
    read: { [functionName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : never : never) => Promise<import("viem").ContractFunctionReturnType<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>> : (...parameters: [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] | [args: readonly unknown[], options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined]) => Promise<import("viem").ReadContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_1 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_1 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_1 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    simulate: { [functionName_2 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | Address | undefined = undefined>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : never : never) => Promise<import("viem").SimulateContractReturnType<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride, accountOverride>> : <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride_1 extends import("viem").Account | Address | undefined = undefined>(...parameters: [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined] | [args: readonly unknown[], options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_2 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_2 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined]) => Promise<import("viem").SimulateContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string> extends true ? unknown : {
    createEventFilter: { [EventName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <const args extends import("viem").MaybeExtractEventArgsFromAbi<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never> | undefined, strict extends boolean | undefined = undefined>(...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never) & {
        strict?: strict | undefined;
    }) | undefined] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | (import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> extends infer T_4 ? T_4 extends import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> ? T_4 extends args ? Readonly<args> : never : never : never), options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_5 ? { [K_2 in keyof T_5]: T_5[K_2]; } : never) & {
        strict?: strict | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never, args, strict>> : <strict_1 extends boolean | undefined = undefined>(...parameters: [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        strict?: undefined;
        toBlock?: undefined;
        args?: undefined;
    }, options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_4 ? { [K_2 in keyof T_4]: T_4[K_2]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType> : never : never; };
    getEvents: { [EventName_1 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] : [args?: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : (...parameters: [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] | [args?: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    } | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : never : never; };
    watchEvent: { [EventName_2 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_3 ? T_3 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_3 extends import("viem").ContractEventName<TAbi> ? T_3 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }>, options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_4 ? T_4 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_4 extends import("viem").ContractEventName<TAbi> ? T_4 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }]) => import("viem").WatchContractEventReturnType : (...parameters: [options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_3 ? T_3 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_3 extends import("viem").ContractEventName<TAbi> ? T_3 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    }, options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_4 ? T_4 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_4 extends import("viem").ContractEventName<TAbi> ? T_4 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined]) => import("viem").WatchContractEventReturnType : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_3 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_4 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_4]: import("abitype").AbiParameterToPrimitiveType<T_4[key_1], abiParameterKind>; } : never) extends infer T_3 ? { [key in keyof T_3]: T_3[key]; } : never) extends infer T_5 ? T_5 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never) ? T_5 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    write: { [functionName_4 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_2 ? T_2 extends import("viem").IsNarrowable<TAbi, Abi> ? T_2 extends true ? <chainOverride extends import("viem").Chain | undefined, options extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_5 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_5]: import("abitype").AbiParameterToPrimitiveType<T_5[key_1], abiParameterKind>; } : never) extends infer T_4 ? { [key in keyof T_4]: T_4[key]; } : never) extends infer T_6 ? T_6 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_10 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_10]: import("abitype").AbiParameterToPrimitiveType<T_10[key_1], abiParameterKind>; } : never) extends infer T_9 ? { [key in keyof T_9]: T_9[key]; } : never) ? T_6 extends readonly [] ? [options: options] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_8 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_8]: import("abitype").AbiParameterToPrimitiveType<T_8[key_1], abiParameterKind>; } : never) extends infer T_7 ? { [key in keyof T_7]: T_7[key]; } : never, options: options] : never : never) => Promise<import("viem").WriteContractReturnType> : <chainOverride extends import("viem").Chain | undefined, options_1 extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never, Rest extends unknown[] = [options: options_1]>(...parameters: Rest | [args: readonly unknown[], ...parameters: Rest]) => Promise<import("viem").WriteContractReturnType> : never : never; };
}) extends infer T_1 ? { [K_1 in keyof T_1]: T_1[K_1]; } : never) & {
    address: `0x${string}`;
    abi: TAbi;
} extends infer T ? { [K in keyof T]: T[K]; } : never) | (((import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string> extends true ? unknown : {
    read: { [functionName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "pure" | "view"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_6 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_6]: import("abitype").AbiParameterToPrimitiveType<T_6[key_1], abiParameterKind>; } : never) extends infer T_5 ? { [key in keyof T_5]: T_5[key]; } : never) extends infer T_7 ? T_7 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_11 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_11]: import("abitype").AbiParameterToPrimitiveType<T_11[key_1], abiParameterKind>; } : never) extends infer T_10 ? { [key in keyof T_10]: T_10[key]; } : never) ? T_7 extends readonly [] ? [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never, options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] : never : never) => Promise<import("viem").ContractFunctionReturnType<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>> : (...parameters: [options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined] | [args: readonly unknown[], options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<TAbi, functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never, import("viem").ContractFunctionArgs<TAbi, "pure" | "view", functionName extends import("viem").ContractFunctionName<TAbi, "pure" | "view"> ? functionName : never>>, "address" | "abi" | "args" | "functionName">> | undefined]) => Promise<import("viem").ReadContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_5 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_6 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_6]: import("abitype").AbiParameterToPrimitiveType<T_6[key_1], abiParameterKind>; } : never) extends infer T_5 ? { [key in keyof T_5]: T_5[key]; } : never) extends infer T_7 ? T_7 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_11 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_11]: import("abitype").AbiParameterToPrimitiveType<T_11[key_1], abiParameterKind>; } : never) extends infer T_10 ? { [key in keyof T_10]: T_10[key]; } : never) ? T_7 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_5 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_5 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    simulate: { [functionName_6 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride extends import("viem").Account | Address | undefined = undefined>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_6 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_6]: import("abitype").AbiParameterToPrimitiveType<T_6[key_1], abiParameterKind>; } : never) extends infer T_5 ? { [key in keyof T_5]: T_5[key]; } : never) extends infer T_7 ? T_7 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_11 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_11]: import("abitype").AbiParameterToPrimitiveType<T_11[key_1], abiParameterKind>; } : never) extends infer T_10 ? { [key in keyof T_10]: T_10[key]; } : never) ? T_7 extends readonly [] ? [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never, options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never>, import("viem").Chain | undefined, chainOverride, accountOverride>, "address" | "abi" | "args" | "functionName"> | undefined] : never : never) => Promise<import("viem").SimulateContractReturnType<TAbi, functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride, accountOverride>> : <chainOverride extends import("viem").Chain | undefined = undefined, accountOverride_1 extends import("viem").Account | Address | undefined = undefined>(...parameters: [options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined] | [args: readonly unknown[], options?: Omit<import("viem").SimulateContractParameters<TAbi, functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_6 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_6 : never>, import("viem").Chain | undefined, chainOverride, accountOverride_1>, "address" | "abi" | "args" | "functionName"> | undefined]) => Promise<import("viem").SimulateContractReturnType> : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string> extends true ? unknown : {
    createEventFilter: { [EventName in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? <const args extends import("viem").MaybeExtractEventArgsFromAbi<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never> | undefined, strict extends boolean | undefined = undefined>(...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_5 ? { [K_4 in keyof T_5]: T_5[K_4]; } : never) & {
        strict?: strict | undefined;
    }) | undefined] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | (import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> extends infer T_6 ? T_6 extends import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName extends import("viem").ContractEventName<TAbi> ? EventName : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> ? T_6 extends args ? Readonly<args> : never : never : never), options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_7 ? { [K_4 in keyof T_7]: T_7[K_4]; } : never) & {
        strict?: strict | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never, args, strict>> : <strict_1 extends boolean | undefined = undefined>(...parameters: [options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_5 ? { [K_4 in keyof T_5]: T_5[K_4]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        strict?: undefined;
        toBlock?: undefined;
        args?: undefined;
    }, options?: ((Omit<import("viem").CreateContractEventFilterParameters<TAbi, EventName extends import("viem").ContractEventName<TAbi> ? EventName : never>, "address" | "strict" | "abi" | "args" | "eventName"> extends infer T_6 ? { [K_4 in keyof T_6]: T_6[K_4]; } : never) & {
        strict?: strict_1 | undefined;
    }) | undefined]) => Promise<import("viem").CreateContractEventFilterReturnType> : never : never; };
    getEvents: { [EventName_1 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] : [args?: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }> | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : (...parameters: [options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined] | [args?: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    } | undefined, options?: {
        strict?: boolean | undefined;
        blockHash?: `0x${string}` | undefined;
        fromBlock?: bigint | import("viem").BlockTag | undefined;
        toBlock?: bigint | import("viem").BlockTag | undefined;
    } | undefined]) => Promise<import("viem").GetContractEventsReturnType<TAbi, EventName_1 extends import("viem").ContractEventName<TAbi> ? EventName_1 : never>> : never : never; };
    watchEvent: { [EventName_2 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiEventNames<TAbi> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? (...parameters: import("viem").IsNever<Extract<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"][number], {
        indexed: true;
    }>> extends true ? [options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_5 ? T_5 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_5 extends import("viem").ContractEventName<TAbi> ? T_5 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }] : [args: import("viem").AbiEventParametersToPrimitiveTypes<(TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "event";
    }>, {
        name: EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never;
    }> : import("abitype").AbiEvent)["inputs"], {
        EnableUnion: true;
        IndexedOnly: true;
        Required: false;
    }>, options: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_6 ? T_6 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_6 extends import("viem").ContractEventName<TAbi> ? T_6 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    }]) => import("viem").WatchContractEventReturnType : (...parameters: [options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_5 ? T_5 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_5 extends import("viem").ContractEventName<TAbi> ? T_5 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined] | [args: readonly unknown[] | {
        [x: string]: unknown;
        address?: undefined;
        abi?: undefined;
        args?: undefined;
        eventName?: undefined;
        fromBlock?: undefined;
        onError?: undefined;
        onLogs?: undefined;
        strict?: undefined;
        poll?: undefined;
        batch?: undefined;
        pollingInterval?: undefined;
    }, options?: {
        onError?: ((error: Error) => void) | undefined | undefined;
        batch?: boolean | undefined | undefined;
        pollingInterval?: number | undefined | undefined;
        strict?: boolean | undefined;
        fromBlock?: bigint | undefined;
        onLogs: import("viem").WatchContractEventOnLogsFn<TAbi, (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) extends infer T_6 ? T_6 extends (EventName_2 extends import("viem").ContractEventName<TAbi> ? EventName_2 : never) ? T_6 extends import("viem").ContractEventName<TAbi> ? T_6 : import("viem").ContractEventName<TAbi> : never : never, undefined>;
        poll?: true | undefined | undefined;
    } | undefined]) => import("viem").WatchContractEventReturnType : never : never; };
}) & (import("viem").IsNever<TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string> extends true ? unknown : {
    estimateGas: { [functionName_3 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? (...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_6 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_6]: import("abitype").AbiParameterToPrimitiveType<T_6[key_1], abiParameterKind>; } : never) extends infer T_5 ? { [key in keyof T_5]: T_5[key]; } : never) extends infer T_7 ? T_7 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_11 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_11]: import("abitype").AbiParameterToPrimitiveType<T_11[key_1], abiParameterKind>; } : never) extends infer T_10 ? { [key in keyof T_10]: T_10[key]; } : never) ? T_7 extends readonly [] ? [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_9 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_9]: import("abitype").AbiParameterToPrimitiveType<T_9[key_1], abiParameterKind>; } : never) extends infer T_8 ? { [key in keyof T_8]: T_8[key]; } : never, options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] : never : never) => Promise<import("viem").EstimateContractGasReturnType> : (...parameters: [options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>] | [args: readonly unknown[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<TAbi, functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_3 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_3 : never>, import("viem").Chain | undefined>, "address" | "abi" | "args" | "functionName">>]) => Promise<import("viem").EstimateContractGasReturnType> : never : never; };
    write: { [functionName_4 in TAbi extends Abi ? Abi extends TAbi ? string : import("abitype").ExtractAbiFunctionNames<TAbi, "nonpayable" | "payable"> : string]: import("viem").IsNarrowable<TAbi, Abi> extends infer T_4 ? T_4 extends import("viem").IsNarrowable<TAbi, Abi> ? T_4 extends true ? <chainOverride extends import("viem").Chain | undefined, options extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_5 ? { [K_4 in keyof T_5]: T_5[K_4]; } : never>(...parameters: (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_7 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_7]: import("abitype").AbiParameterToPrimitiveType<T_7[key_1], abiParameterKind>; } : never) extends infer T_6 ? { [key in keyof T_6]: T_6[key]; } : never) extends infer T_8 ? T_8 extends (((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_12 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_12]: import("abitype").AbiParameterToPrimitiveType<T_12[key_1], abiParameterKind>; } : never) extends infer T_11 ? { [key in keyof T_11]: T_11[key]; } : never) ? T_8 extends readonly [] ? [options: options] : [args: ((TAbi extends Abi ? Extract<Extract<TAbi[number], {
        type: "function";
        stateMutability: import("abitype").AbiStateMutability;
    }>, {
        name: functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never;
    }> : import("abitype").AbiFunction)["inputs"] extends infer T_10 extends readonly import("abitype").AbiParameter[] ? { [key_1 in keyof T_10]: import("abitype").AbiParameterToPrimitiveType<T_10[key_1], abiParameterKind>; } : never) extends infer T_9 ? { [key in keyof T_9]: T_9[key]; } : never, options: options] : never : never) => Promise<import("viem").WriteContractReturnType> : <chainOverride extends import("viem").Chain | undefined, options_1 extends import("viem").UnionOmit<import("viem").WriteContractParameters<TAbi, functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never, import("viem").ContractFunctionArgs<TAbi, "nonpayable" | "payable", functionName_4 extends import("viem").ContractFunctionName<TAbi, "nonpayable" | "payable"> ? functionName_4 : never>, import("viem").Chain | undefined, import("viem").Account | undefined, chainOverride>, "address" | "abi" | "args" | "functionName"> extends infer T_5 ? { [K_4 in keyof T_5]: T_5[K_4]; } : never, Rest extends unknown[] = [options: options_1]>(...parameters: Rest | [args: readonly unknown[], ...parameters: Rest]) => Promise<import("viem").WriteContractReturnType> : never : never; };
}) extends infer T_3 ? { [K_3 in keyof T_3]: T_3[K_3]; } : never) & {
    address: `0x${string}`;
    abi: TAbi;
} extends infer T_2 ? { [K_2 in keyof T_2]: T_2[K_2]; } : never);
