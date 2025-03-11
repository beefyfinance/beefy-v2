import type { FC, FunctionComponent, SVGProps } from 'react';
import type { BadgeComponent } from '../Badges/types.ts';
import type { SvgProps } from '../../../../features/data/utils/types-utils.ts';

type BaseNavItemProps = {
  title: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  Badge?: BadgeComponent;
  onClick?: () => void;
  className?: string;
  end?: boolean;
};

export type NavItemProps = BaseNavItemProps & {
  url: string;
  mobile?: boolean;
};

export type NavItemInnerProps = Pick<NavItemProps, 'title' | 'Icon' | 'Badge'> & {
  Arrow?: FunctionComponent<SvgProps<SVGSVGElement>>;
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
