import BigNumber from 'bignumber.js';
export declare function useInputForm(balance: BigNumber, decimals: number): {
    formData: {
        amount: BigNumber;
        max: boolean;
    };
    handleChange: (value: BigNumber, isMax: boolean) => void;
    handleMax: () => void;
};
