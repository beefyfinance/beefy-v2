import { type FC } from 'react';
import type { BadgeComponent } from '../Badges/types';
import type { NavItemConfig } from './types';
interface DropNavItemProps {
    title: string;
    Icon: FC;
    items: NavItemConfig[];
    Badge?: BadgeComponent;
}
export declare const DropNavItem: import("react").NamedExoticComponent<DropNavItemProps>;
export {};
