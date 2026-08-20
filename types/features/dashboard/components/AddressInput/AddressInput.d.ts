type AddressInputProps = {
    active?: boolean;
    setActive?: (active: boolean) => void;
    variant?: 'default' | 'transparent';
};
export declare const AddressInput: (({ variant, active: controlledActive, setActive: controlledSetActive, }: AddressInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
