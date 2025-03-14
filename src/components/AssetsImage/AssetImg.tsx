import { css, cx } from '@repo/styles/css';
import { memo } from 'react';

const baseClass = css({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
  borderRadius: '100%',
});

type AssetImgProps = {
  src: string;
  className?: string;
};

export const AssetImg = memo<AssetImgProps>(function AssetImg({ src, className }) {
  return (
    <img
      src={src}
      alt=""
      role="presentation"
      className={cx(baseClass, className)}
      width={48}
      height={48}
    />
  );
});
