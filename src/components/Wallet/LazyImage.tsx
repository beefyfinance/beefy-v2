import { type ComponentPropsWithoutRef, memo, useEffect, useState } from 'react';
import type { Styles } from '@repo/styles/types';
import { css, cx } from '@repo/styles/css';
import type { LazyValue, Scalar } from '../../features/data/apis/wallet/helpers.ts';

type LazyImageProps = Omit<ComponentPropsWithoutRef<'img'>, 'src'> & {
  src?: LazyValue<string>;
  css?: Styles | Styles[];
};

function useLazyValue<T extends Scalar>(value: LazyValue<T>, defaultValue: T): T {
  const [resolvedValue, setResolvedValue] = useState<T>(
    typeof value === 'function' ? defaultValue : value
  );

  useEffect(() => {
    const fetchValue = async () => {
      return typeof value === 'function' ? await value() : value;
    };
    fetchValue()
      .then(setResolvedValue)
      .catch(err => {
        console.error('Failed to resolve lazy value', err);
      });
  }, [value]);

  return resolvedValue;
}

export const LazyImage = memo(function LazyImage({
  src: lazySrc,
  className,
  css: cssProp,
  ...rest
}: LazyImageProps) {
  const src = useLazyValue(
    lazySrc,
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
  );
  return <img src={src} className={cx(className, css(cssProp))} {...rest} />;
});
