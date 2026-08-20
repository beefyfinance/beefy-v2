import type { FC, SVGProps } from 'react';
interface LinkIconProps {
    logo: string | FC<SVGProps<SVGSVGElement>>;
    alt: string;
    href: string;
}
export declare const LinkIcon: FC<LinkIconProps>;
export {};
