import { FC, FunctionComponent, SVGProps } from 'react';
import { BadgeComponent } from '../Badges/types';

type BaseNavItemProps = {
  title: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  Badge?: BadgeComponent;
  onClick?: () => void;
  className?: string;
};

export type NavItemProps = BaseNavItemProps & {
  url: string;
};

export type NavDropdownProps = BaseNavItemProps & {
  items: NavItemConfig[];
};

export type NavItemComponent = FC<NavItemProps>;
export type NavDropdownComponent = FC<NavDropdownProps>;

export type NavItemConfig = Exclude<NavItemProps, 'onClick'> & {
  Component?: NavItemComponent;
  MobileComponent?: NavItemComponent;
};

export type NavDropdownConfig = Exclude<NavDropdownProps, 'items' | 'onClick'> & {
  Component?: NavDropdownComponent;
  MobileComponent?: NavDropdownComponent;
  items: NavItemConfig[];
};

export type NavConfig = NavItemConfig | NavDropdownConfig;

export function isNavItemConfig(config: NavConfig): config is NavItemConfig {
  return 'url' in config;
}

export function isNavDropdownConfig(config: NavConfig): config is NavDropdownConfig {
  return 'items' in config;
}
