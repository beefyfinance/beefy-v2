export declare const transactionRecipe: import("../../../../.cache/styles/types").SlotRecipeRuntimeFn<"transaction" | "transactionHeader" | "transactionHeaderIndex" | "transactionHeaderStep" | "transactionHeaderStatus" | "transactionDetails", {
    status: {
        success: {
            transactionHeaderStatus: {
                color: "indicators.success";
            };
        };
        revert: {
            transactionHeaderStatus: {
                color: "indicators.error";
            };
        };
        missing: {
            transactionHeaderStatus: {
                color: "text.dark";
            };
        };
    };
}>;
export declare const stackRecipe: import("../../../../.cache/styles/types").SlotRecipeRuntimeFn<"stack" | "stackIndent" | "stackDetails" | "stackToFunc" | "stackTo" | "stackFunc" | "stackFuncAccessor" | "stackFuncParamsOpen" | "stackFuncParamsClose" | "stackFuncOutput" | "stackInput" | "stackOutput" | "stackPair" | "stackPairName" | "stackTag" | "stackSource", {
    type: {
        revert: {
            stackTag: {
                backgroundColor: "tenderlyRevertStackTagBackground";
                border: "1px solid tenderlyRevertStackTagBackground";
                color: "tenderlyStackSourceStrongText";
                '&:hover': {
                    borderColor: "tenderlyRevertStackTagBorder";
                };
            };
        };
        call: {
            stackTag: {
                backgroundColor: "tenderlyCallStackTagBackground";
                border: "1px solid tenderlyCallStackTagBackground";
                color: "tenderlyCallStackTagText";
                '&:hover': {
                    borderColor: "tenderlyCallStackTagText";
                };
            };
        };
        delegatecall: {
            stackTag: {
                backgroundColor: "tenderlyCallStackTagBackground";
                border: "1px solid tenderlyCallStackTagBackground";
                color: "tenderlyCallStackTagText";
                '&:hover': {
                    borderColor: "tenderlyCallStackTagText";
                };
            };
        };
        jumpdest: {
            stackTag: {
                backgroundColor: "tenderlyJumpDestStackTagBackground";
                border: "1px solid tenderlyJumpDestStackTagBackground";
                color: "tenderlyJumpDestStackTagText";
                '&:hover': {
                    borderColor: "tenderlyJumpDestStackTagBorder";
                };
            };
        };
        other: {};
        unknown: {};
    };
}>;
export declare const styles: {
    label: import("../../../../.cache/styles/types").SystemStyleObject;
    reverts: import("../../../../.cache/styles/types").SystemStyleObject;
    revert: import("../../../../.cache/styles/types").SystemStyleObject;
    revertStack: import("../../../../.cache/styles/types").SystemStyleObject;
    bytesDisplay: import("../../../../.cache/styles/types").SystemStyleObject;
    bytesDisplayInner: import("../../../../.cache/styles/types").SystemStyleObject;
    bytesDisplayLine: import("../../../../.cache/styles/types").SystemStyleObject;
    paramsDisplay: import("../../../../.cache/styles/types").SystemStyleObject;
    pairDisplay: import("../../../../.cache/styles/types").SystemStyleObject;
    pairDisplayKey: import("../../../../.cache/styles/types").SystemStyleObject;
    pairDisplayOdd: import("../../../../.cache/styles/types").SystemStyleObject;
    calls: import("../../../../.cache/styles/types").SystemStyleObject;
    callHeader: import("../../../../.cache/styles/types").SystemStyleObject;
    callData: import("../../../../.cache/styles/types").SystemStyleObject;
};
