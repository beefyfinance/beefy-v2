import type { FC, SVGProps } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface LinkIconProps {
  logo: string | FC<SVGProps<SVGSVGElement>>;
  alt: string;
  href: string;
}

export const LinkIcon: FC<LinkIconProps> = ({ href, logo, alt }) => {
  const classes = useStyles();
  const IconComponent = typeof logo === 'string' ? 'img' : logo;

  return (
    <a className={classes.link} href={href} target="_blank">
      {typeof logo === 'string' ?
        <img alt={alt} src={logo} />
      : <IconComponent className={classes.svgIcon} />}
    </a>
  );
};
