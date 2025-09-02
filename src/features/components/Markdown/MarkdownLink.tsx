import { type AnchorHTMLAttributes, type DetailedHTMLProps, memo } from 'react';
import { css } from '@repo/styles/css';
import { Link } from 'react-router';
import { ExternalLink } from '../../../components/Links/ExternalLink.tsx';

const linkClass = css({
  textDecoration: 'none',
  color: 'green.40',
  cursor: 'pointer',
});

type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const MarkdownLink = memo(function MarkdownLink({ href, children }: AnchorProps) {
  return href?.startsWith('/') ?
      <Link to={href} className={linkClass} children={children} />
    : <ExternalLink href={href} className={linkClass} children={children} />;
});
