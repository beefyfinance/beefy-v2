import { type FunctionComponent, memo, type SVGProps } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type IconButtonProps = {
  href: string;
  text: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  className?: string;
  textClassName?: string;
};

export const IconButton = memo<IconButtonProps>(function IconButton({
  href,
  text,
  Icon,
  className,
  textClassName,
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
      <Icon className={classes.icon} />
      <span className={clsx(classes.text, textClassName)}>{text}</span>
    </a>
  );
});
