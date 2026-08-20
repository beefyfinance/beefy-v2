import { LinkIcon } from 'beefy-v2';
import type { SVGProps } from 'react';

const DiscordLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.3 4.5A19 19 0 0 0 15.6 3l-.24.44c1.6.4 2.34.96 3.14 1.64a11 11 0 0 0-3.9-1.24 14.3 14.3 0 0 0-5.2 0A11 11 0 0 0 5.5 5.1c.8-.68 1.7-1.3 3.14-1.64L8.4 3a19 19 0 0 0-4.7 1.5C1.2 8.2.5 11.9.8 15.5a19 19 0 0 0 5.8 2.9l1.2-1.9c-.7-.26-1.4-.6-2-1l.5-.36a13.6 13.6 0 0 0 11.4 0l.5.36c-.6.4-1.3.74-2 1l1.2 1.9a19 19 0 0 0 5.8-2.9c.4-4.2-.7-7.9-2.9-11zM8.5 13.6c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3zm7 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3z" />
  </svg>
);

export const SvgLogo = () => (
  <LinkIcon href="https://discord.gg/beefy" alt="Discord" logo={DiscordLogo} />
);

const TelegramLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14L18 6.3c.4-.36-.09-.56-.63-.2L6.4 13.06 1.4 11.5c-1.08-.34-1.1-1.08.23-1.6L20.5 2.62c.9-.33 1.7.22 1.4 1.68z" />
  </svg>
);

export const Row = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <LinkIcon href="https://discord.gg/beefy" alt="Discord" logo={DiscordLogo} />
    <LinkIcon href="https://t.me/beefyfinance" alt="Telegram" logo={TelegramLogo} />
  </div>
);
