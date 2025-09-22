import { type AnchorHTMLAttributes, forwardRef, type MouseEvent, type Ref, useMemo } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useIsInMiniApp } from '../MiniApp/hooks.ts';

export type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
  bypassMiniApp?: boolean;
};

export const ExternalLink = forwardRef(function ExternalLink(
  props: ExternalLinkProps,
  ref: Ref<HTMLAnchorElement>
) {
  const isInMiniApp = useIsInMiniApp();
  const { bypassMiniApp, ...anchorProps } = props;
  const { href, onClick: originalOnClick } = anchorProps;
  const onClick = useMemo(() => {
    if (isInMiniApp && href && !bypassMiniApp) {
      return (e: MouseEvent<HTMLAnchorElement>) => {
        // Call any original onClick handler first
        if (originalOnClick) {
          originalOnClick(e);
          if (e.isDefaultPrevented()) {
            return;
          }
        }
        // Stop the link click from opening new tab
        e.preventDefault();
        // Try to open via the SDK, fallback to window.open if that fails
        sdk.actions.openUrl(href).catch(() => {
          window.open(href, '_blank', 'noopener');
        });
      };
    }
    return originalOnClick;
  }, [isInMiniApp, href, originalOnClick, bypassMiniApp]);

  return <a {...anchorProps} target="_blank" rel="noopener" ref={ref} onClick={onClick} />;
});
