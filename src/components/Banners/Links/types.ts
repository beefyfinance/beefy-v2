import type { ReactNode } from 'react';

type CommonLinkProps = {
  children?: ReactNode;
  className?: string;
};

export type InternalLinkProps = {
  to: string;
} & CommonLinkProps;

export type ExternalLinkProps = {
  href: string;
} & CommonLinkProps;

export type ButtonLinkProps = {
  onClick: () => void;
} & CommonLinkProps;
