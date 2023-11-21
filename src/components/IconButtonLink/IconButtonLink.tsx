import { type FunctionComponent, memo, type SVGProps } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type IconButtonLinkProps = {
  href: string;
  text: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
};

export const IconButtonLink = memo<IconButtonLinkProps>(function IconButtonLink({
  href,
  text,
  Icon,
  className,
  textClassName,
  iconClassName,
}) {
  const classes = useStyles();
  return (
    <a
      className={clsx(className, classes.link)}
      href={href}
      target="_blank"
      title={text}
      rel="noopener noreferrer"
    >
      <Icon className={clsx(classes.icon, iconClassName)} />
      <span className={clsx(classes.text, textClassName)}>{text}</span>
    </a>
  );
});
