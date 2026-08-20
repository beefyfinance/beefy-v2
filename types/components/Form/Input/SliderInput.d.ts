interface SliderInputProps {
    value: BigNumber;
    maxValue: BigNumber;
    onChange?: (value: BigNumber, isMax: boolean) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    size?: 'sm' | 'md';
}
export declare const SliderInput: (({ value, maxValue, onChange, min, max, step, disabled, size, }: SliderInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
