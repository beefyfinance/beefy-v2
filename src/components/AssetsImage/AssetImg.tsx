import { DetailedHTMLProps, ImgHTMLAttributes, memo, useCallback, useState } from 'react';
import { useAsync } from '../../helpers/useAsync';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

type ImgProps = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
type AssetImgProps = Omit<ImgProps, 'src' | 'onError'> & {
  loader: () => Promise<string>;
  width: number;
  height: number;
  loadingClassName?: string;
  errorClassName?: string;
  successClassName?: string;
};

export const AssetImg = memo<AssetImgProps>(function AssetImg({
  loader,
  className,
  loadingClassName,
  errorClassName,
  successClassName,
  width,
  height,
  ...props
}) {
  const classes = useStyles();
  const { status, value } = useAsync<string>(loader);
  const [imgError, setImgError] = useState(false);
  const handleError = useCallback(() => {
    setImgError(true);
  }, [setImgError]);

  if (status === 'success' && value) {
    return (
      <img
        {...props}
        src={value}
        onError={handleError}
        className={clsx(className, successClassName)}
      />
    );
  }

  const isError = status === 'error' || imgError;
  const isLoading = !isError;

  return (
    <div
      className={clsx(classes.placeholder, className, {
        [classes.placeholder]: true,
        [classes.placeholderError]: isError,
        [classes.placeholderLoading]: isLoading,
        [className]: true,
        [errorClassName]: isError,
        [loadingClassName]: isLoading,
      })}
    />
  );
});
