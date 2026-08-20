import * as React from 'react';

/**
 * SearchInput — from beefy-v2@0.1.0.
 */
export interface SearchInputProps {
  onValueChange: (newValue: string) => void;
  value: string;
  minLength?: number;
  placeholder?: string;
  focusOnSlash?: boolean;
}

export declare const SearchInput: React.ComponentType<SearchInputProps>;
