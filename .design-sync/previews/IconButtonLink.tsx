import { IconButtonLink } from 'beefy-v2';
import type { SVGProps } from 'react';

// The DS takes the icon as a component; Beefy passes its own bundled svgs here.
const GithubIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
  </svg>
);

const TwitterIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.9 2.3h3.3l-7.2 8.2 8.4 11.2h-6.6l-5.2-6.8-5.9 6.8H2.4l7.7-8.8L2 2.3h6.8l4.7 6.2 5.4-6.2zm-1.2 17.6h1.8L7.4 4.1H5.5l12.2 15.8z" />
  </svg>
);

export const Default = () => (
  <IconButtonLink href="https://github.com/beefyfinance" text="GitHub" Icon={GithubIcon} />
);

export const Row = () => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
    <IconButtonLink href="https://github.com/beefyfinance" text="GitHub" Icon={GithubIcon} />
    <IconButtonLink href="https://x.com/beefyfinance" text="Twitter" Icon={TwitterIcon} />
  </div>
);
