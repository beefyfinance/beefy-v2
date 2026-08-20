import { type MutableRefObject, type RefObject } from 'react';
interface FloatingErrorProps {
    userInput: string;
    inputMode: 'address' | 'domain';
    isAddressValid: boolean;
    isDomainValid: boolean;
    isDomainResolving: boolean;
    reference: RefObject<HTMLInputElement> | MutableRefObject<HTMLInputElement>;
}
export declare const FloatingError: (({ userInput, inputMode, isAddressValid, isDomainValid, isDomainResolving, reference, }: FloatingErrorProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
