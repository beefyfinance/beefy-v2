import { type AnchorHTMLAttributes, forwardRef, type Ref } from 'react';

export type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'>;

export const ExternalLink = forwardRef(function ExternalLink(
  props: ExternalLinkProps,
  ref: Ref<HTMLAnchorElement>
) {
  return <a {...props} target="_blank" rel="noopener" ref={ref} />;
});
