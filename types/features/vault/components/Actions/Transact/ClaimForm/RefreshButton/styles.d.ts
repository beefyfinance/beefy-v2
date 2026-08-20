export declare const refreshRecipe: import("../../../../../../../../.cache/styles/types").SlotRecipeRuntimeFn<"icon" | "button" | "container", {
    status: {
        loading: {
            icon: {
                color: "text.dark";
                animationName: "rotate";
                animationDuration: "3s";
                animationIterationCount: "infinite";
                animationTimingFunction: "linear";
            };
        };
        loaded: {
            container: {
                display: "none";
            };
            icon: {
                color: "indicators.success";
            };
        };
        error: {
            icon: {
                color: "indicators.warning";
            };
        };
    };
    canLoad: {
        true: {
            container: {
                display: "block";
            };
        };
    };
}>;
