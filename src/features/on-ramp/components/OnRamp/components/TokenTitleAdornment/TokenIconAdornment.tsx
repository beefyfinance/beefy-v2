import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type TokenIconAdornmentProps = {
  token: string;
  className?: string;
};
export const TokenIconAdornment = memo<TokenIconAdornmentProps>(function TokenIconAdornment({
  token,
  className,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.tokenAdornment, className)}>
      <AssetsImage chainId={undefined} assetIds={[token]} size={24} className={classes.icon} />
      {token}
    </div>
  );
});
