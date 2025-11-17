import type { ComponentType, ReactNode } from 'react';

export type BaseWalletStepProps = {
  Layout: ComponentType<{
    title: string;
    description?: ReactNode;
    main: ReactNode;
    footer?: ReactNode;
  }>;
};
