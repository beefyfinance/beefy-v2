// Wraps every preview card in Beefy's app surface (cfg.provider).
//
// Beefy is a dark-surface design system: text.middle is white-90 and several
// component backgrounds are translucent (alert.info.background is #5c70d623).
// The converter's card chrome hardcodes body{background:#fff}, so without this
// wrapper those components composite over white and render illegible — a
// misrepresentation of how they actually look.
//
// The custom properties come from the same panda cssgen run that produced the
// stylesheet the card links, so the names always resolve.
import { createElement, type ReactNode } from 'react';

export function BeefySurface({ children }: { children?: ReactNode }) {
  return createElement(
    'div',
    {
      style: {
        backgroundColor: 'var(--colors-background-content)',
        color: 'var(--colors-text-middle)',
        padding: '24px',
        borderRadius: '12px',
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      },
    },
    children
  );
}
