import type { ComponentType, ReactNode } from 'react';

export type WalletStepLayoutProps = {
  content: ReactNode;
  button?: ReactNode;
  hideIntroduction?: boolean;
};

export type BaseWalletStepProps = {
  Layout: ComponentType<WalletStepLayoutProps>;
  hideIntroduction?: boolean;
};
