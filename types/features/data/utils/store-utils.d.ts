import type { BeefyDispatchFn, BeefyState } from '../store/types';
export declare const createAppSlice: <State, CaseReducers extends import("@reduxjs/toolkit").SliceCaseReducers<State>, Name extends string, Selectors extends import("@reduxjs/toolkit").SliceSelectors<State>, ReducerPath extends string = Name>(options: import("@reduxjs/toolkit").CreateSliceOptions<State, CaseReducers, Name, ReducerPath, Selectors>) => import("@reduxjs/toolkit").Slice<State, CaseReducers, Name, ReducerPath, Selectors>;
export declare const createAppAsyncThunk: import("@reduxjs/toolkit").CreateAsyncThunkFunction<{
    state: BeefyState;
    dispatch: BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}> & {
    withTypes<ThunkApiConfig extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig & Omit<{
        state: BeefyState;
        dispatch: BeefyDispatchFn;
        extra?: unknown;
        rejectValue?: unknown;
        serializedErrorType?: unknown;
        pendingMeta?: unknown;
        fulfilledMeta?: unknown;
        rejectedMeta?: unknown;
    }, keyof ThunkApiConfig> extends infer T ? { [K in keyof T]: T[K]; } : never> & {
        withTypes<ThunkApiConfig_1 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
            state: BeefyState;
            dispatch: BeefyDispatchFn;
            extra?: unknown;
            rejectValue?: unknown;
            serializedErrorType?: unknown;
            pendingMeta?: unknown;
            fulfilledMeta?: unknown;
            rejectedMeta?: unknown;
        }, keyof ThunkApiConfig> extends infer T_2 ? { [K in keyof T_2]: T_2[K]; } : never, keyof ThunkApiConfig_1> extends infer T_1 ? { [K_1 in keyof T_1]: T_1[K_1]; } : never> & {
            withTypes<ThunkApiConfig_2 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                state: BeefyState;
                dispatch: BeefyDispatchFn;
                extra?: unknown;
                rejectValue?: unknown;
                serializedErrorType?: unknown;
                pendingMeta?: unknown;
                fulfilledMeta?: unknown;
                rejectedMeta?: unknown;
            }, keyof ThunkApiConfig> extends infer T_5 ? { [K in keyof T_5]: T_5[K]; } : never, keyof ThunkApiConfig_1> extends infer T_4 ? { [K_1 in keyof T_4]: T_4[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_3 ? { [K_2 in keyof T_3]: T_3[K_2]; } : never> & {
                withTypes<ThunkApiConfig_3 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                    state: BeefyState;
                    dispatch: BeefyDispatchFn;
                    extra?: unknown;
                    rejectValue?: unknown;
                    serializedErrorType?: unknown;
                    pendingMeta?: unknown;
                    fulfilledMeta?: unknown;
                    rejectedMeta?: unknown;
                }, keyof ThunkApiConfig> extends infer T_9 ? { [K in keyof T_9]: T_9[K]; } : never, keyof ThunkApiConfig_1> extends infer T_8 ? { [K_1 in keyof T_8]: T_8[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_7 ? { [K_2 in keyof T_7]: T_7[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_6 ? { [K_3 in keyof T_6]: T_6[K_3]; } : never> & {
                    withTypes<ThunkApiConfig_4 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                        state: BeefyState;
                        dispatch: BeefyDispatchFn;
                        extra?: unknown;
                        rejectValue?: unknown;
                        serializedErrorType?: unknown;
                        pendingMeta?: unknown;
                        fulfilledMeta?: unknown;
                        rejectedMeta?: unknown;
                    }, keyof ThunkApiConfig> extends infer T_14 ? { [K in keyof T_14]: T_14[K]; } : never, keyof ThunkApiConfig_1> extends infer T_13 ? { [K_1 in keyof T_13]: T_13[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_12 ? { [K_2 in keyof T_12]: T_12[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_11 ? { [K_3 in keyof T_11]: T_11[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_10 ? { [K_4 in keyof T_10]: T_10[K_4]; } : never> & {
                        withTypes<ThunkApiConfig_5 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                            state: BeefyState;
                            dispatch: BeefyDispatchFn;
                            extra?: unknown;
                            rejectValue?: unknown;
                            serializedErrorType?: unknown;
                            pendingMeta?: unknown;
                            fulfilledMeta?: unknown;
                            rejectedMeta?: unknown;
                        }, keyof ThunkApiConfig> extends infer T_20 ? { [K in keyof T_20]: T_20[K]; } : never, keyof ThunkApiConfig_1> extends infer T_19 ? { [K_1 in keyof T_19]: T_19[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_18 ? { [K_2 in keyof T_18]: T_18[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_17 ? { [K_3 in keyof T_17]: T_17[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_16 ? { [K_4 in keyof T_16]: T_16[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_15 ? { [K_5 in keyof T_15]: T_15[K_5]; } : never> & {
                            withTypes<ThunkApiConfig_6 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_6 & Omit<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                                state: BeefyState;
                                dispatch: BeefyDispatchFn;
                                extra?: unknown;
                                rejectValue?: unknown;
                                serializedErrorType?: unknown;
                                pendingMeta?: unknown;
                                fulfilledMeta?: unknown;
                                rejectedMeta?: unknown;
                            }, keyof ThunkApiConfig> extends infer T_27 ? { [K in keyof T_27]: T_27[K]; } : never, keyof ThunkApiConfig_1> extends infer T_26 ? { [K_1 in keyof T_26]: T_26[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_25 ? { [K_2 in keyof T_25]: T_25[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_24 ? { [K_3 in keyof T_24]: T_24[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_23 ? { [K_4 in keyof T_23]: T_23[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_22 ? { [K_5 in keyof T_22]: T_22[K_5]; } : never, keyof ThunkApiConfig_6> extends infer T_21 ? { [K_6 in keyof T_21]: T_21[K_6]; } : never> & {
                                withTypes<ThunkApiConfig_7 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_7 & Omit<ThunkApiConfig_6 & Omit<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                                    state: BeefyState;
                                    dispatch: BeefyDispatchFn;
                                    extra?: unknown;
                                    rejectValue?: unknown;
                                    serializedErrorType?: unknown;
                                    pendingMeta?: unknown;
                                    fulfilledMeta?: unknown;
                                    rejectedMeta?: unknown;
                                }, keyof ThunkApiConfig> extends infer T_35 ? { [K in keyof T_35]: T_35[K]; } : never, keyof ThunkApiConfig_1> extends infer T_34 ? { [K_1 in keyof T_34]: T_34[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_33 ? { [K_2 in keyof T_33]: T_33[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_32 ? { [K_3 in keyof T_32]: T_32[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_31 ? { [K_4 in keyof T_31]: T_31[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_30 ? { [K_5 in keyof T_30]: T_30[K_5]; } : never, keyof ThunkApiConfig_6> extends infer T_29 ? { [K_6 in keyof T_29]: T_29[K_6]; } : never, keyof ThunkApiConfig_7> extends infer T_28 ? { [K_7 in keyof T_28]: T_28[K_7]; } : never> & {
                                    withTypes<ThunkApiConfig_8 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_8 & Omit<ThunkApiConfig_7 & Omit<ThunkApiConfig_6 & Omit<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                                        state: BeefyState;
                                        dispatch: BeefyDispatchFn;
                                        extra?: unknown;
                                        rejectValue?: unknown;
                                        serializedErrorType?: unknown;
                                        pendingMeta?: unknown;
                                        fulfilledMeta?: unknown;
                                        rejectedMeta?: unknown;
                                    }, keyof ThunkApiConfig> extends infer T_44 ? { [K in keyof T_44]: T_44[K]; } : never, keyof ThunkApiConfig_1> extends infer T_43 ? { [K_1 in keyof T_43]: T_43[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_42 ? { [K_2 in keyof T_42]: T_42[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_41 ? { [K_3 in keyof T_41]: T_41[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_40 ? { [K_4 in keyof T_40]: T_40[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_39 ? { [K_5 in keyof T_39]: T_39[K_5]; } : never, keyof ThunkApiConfig_6> extends infer T_38 ? { [K_6 in keyof T_38]: T_38[K_6]; } : never, keyof ThunkApiConfig_7> extends infer T_37 ? { [K_7 in keyof T_37]: T_37[K_7]; } : never, keyof ThunkApiConfig_8> extends infer T_36 ? { [K_8 in keyof T_36]: T_36[K_8]; } : never> & {
                                        withTypes<ThunkApiConfig_9 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_9 & Omit<ThunkApiConfig_8 & Omit<ThunkApiConfig_7 & Omit<ThunkApiConfig_6 & Omit<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit<{
                                            state: BeefyState;
                                            dispatch: BeefyDispatchFn;
                                            extra?: unknown;
                                            rejectValue?: unknown;
                                            serializedErrorType?: unknown;
                                            pendingMeta?: unknown;
                                            fulfilledMeta?: unknown;
                                            rejectedMeta?: unknown;
                                        }, keyof ThunkApiConfig> extends infer T_54 ? { [K in keyof T_54]: T_54[K]; } : never, keyof ThunkApiConfig_1> extends infer T_53 ? { [K_1 in keyof T_53]: T_53[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_52 ? { [K_2 in keyof T_52]: T_52[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_51 ? { [K_3 in keyof T_51]: T_51[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_50 ? { [K_4 in keyof T_50]: T_50[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_49 ? { [K_5 in keyof T_49]: T_49[K_5]; } : never, keyof ThunkApiConfig_6> extends infer T_48 ? { [K_6 in keyof T_48]: T_48[K_6]; } : never, keyof ThunkApiConfig_7> extends infer T_47 ? { [K_7 in keyof T_47]: T_47[K_7]; } : never, keyof ThunkApiConfig_8> extends infer T_46 ? { [K_8 in keyof T_46]: T_46[K_8]; } : never, keyof ThunkApiConfig_9> extends infer T_45 ? { [K_9 in keyof T_45]: T_45[K_9]; } : never> & {
                                            withTypes<ThunkApiConfig_10 extends import("@reduxjs/toolkit").AsyncThunkConfig>(): import("@reduxjs/toolkit").CreateAsyncThunkFunction<ThunkApiConfig_10 & Omit<ThunkApiConfig_9 & Omit<ThunkApiConfig_8 & Omit<ThunkApiConfig_7 & Omit<ThunkApiConfig_6 & Omit<ThunkApiConfig_5 & Omit<ThunkApiConfig_4 & Omit<ThunkApiConfig_3 & Omit<ThunkApiConfig_2 & Omit<ThunkApiConfig_1 & Omit<ThunkApiConfig & Omit</*elided*/ any, keyof ThunkApiConfig> extends infer T_65 ? { [K in keyof T_65]: T_65[K]; } : never, keyof ThunkApiConfig_1> extends infer T_64 ? { [K_1 in keyof T_64]: T_64[K_1]; } : never, keyof ThunkApiConfig_2> extends infer T_63 ? { [K_2 in keyof T_63]: T_63[K_2]; } : never, keyof ThunkApiConfig_3> extends infer T_62 ? { [K_3 in keyof T_62]: T_62[K_3]; } : never, keyof ThunkApiConfig_4> extends infer T_61 ? { [K_4 in keyof T_61]: T_61[K_4]; } : never, keyof ThunkApiConfig_5> extends infer T_60 ? { [K_5 in keyof T_60]: T_60[K_5]; } : never, keyof ThunkApiConfig_6> extends infer T_59 ? { [K_6 in keyof T_59]: T_59[K_6]; } : never, keyof ThunkApiConfig_7> extends infer T_58 ? { [K_7 in keyof T_58]: T_58[K_7]; } : never, keyof ThunkApiConfig_8> extends infer T_57 ? { [K_8 in keyof T_57]: T_57[K_8]; } : never, keyof ThunkApiConfig_9> extends infer T_56 ? { [K_9 in keyof T_56]: T_56[K_9]; } : never, keyof ThunkApiConfig_10> extends infer T_55 ? { [K_10 in keyof T_55]: T_55[K_10]; } : never> & /*elided*/ any;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
