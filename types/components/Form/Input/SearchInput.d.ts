import { type BaseInputProps } from './BaseInput';
import type { Override } from '../../../features/data/utils/types-utils';
export type SearchInputProps = Override<Omit<BaseInputProps, 'fullWidth' | 'endAdornment'>, {
    onValueChange: (newValue: string) => void;
    value: string;
    minLength?: number;
    placeholder?: string;
    focusOnSlash?: boolean;
}>;
export declare const SearchInput: (({ onValueChange, value, minLength, placeholder, onChange, warning, focusOnSlash, onFocus, onBlur, ...rest }: SearchInputProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
