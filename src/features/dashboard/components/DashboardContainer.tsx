import { memo, type ReactNode } from 'react';
import { css } from '@repo/styles/css';

type DashboardContainerProps = {
  children: ReactNode;
};

const className = css({
  flex: '1 1 auto',
  paddingBottom: '48px',
});

export const DashboardContainer = memo(function DashboardContainer({
  children,
}: DashboardContainerProps) {
  return <div className={className}>{children}</div>;
});
