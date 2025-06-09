import { type AnchorHTMLAttributes, type DetailedHTMLProps, memo } from 'react';
import { css } from '@repo/styles/css';
import { Link } from 'react-router';

const linkClass = css({
  textDecoration: 'none',
  color: 'green',
  cursor: 'pointer',
});

type AnchorProps = DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const MarkdownLink = memo(function MarkdownLink({ href, children }: AnchorProps) {
  return href?.startsWith('/') ?
      <Link to={href} className={linkClass} children={children} />
    : <a
        href={href}
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
        children={children}
      />;
});
