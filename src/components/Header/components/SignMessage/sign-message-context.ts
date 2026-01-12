import { createContext } from 'react';

export type SignMessageContextType = {
  openModal: (message?: string) => void;
};

export const SignMessageContext = createContext<SignMessageContextType | null>(null);
