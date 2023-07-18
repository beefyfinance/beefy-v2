import type { FC } from 'react';

export type BadgeComponentProps = {
  className?: string;
  spacer?: boolean;
};

export type BadgeComponent = FC<BadgeComponentProps>;
