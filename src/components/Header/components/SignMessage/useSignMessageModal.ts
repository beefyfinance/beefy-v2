import { useContext } from 'react';
import { SignMessageContext } from './sign-message-context.ts';

export const useSignMessageModal = () => {
  const context = useContext(SignMessageContext);
  if (!context) {
    throw new Error('useSignMessageModal must be used within SignMessageProvider');
  }
  return context;
};
