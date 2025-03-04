import type { ComponentProps, ComponentType, Ref, ReactElement, RefAttributes } from 'react';

declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: Ref<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function memo<T extends ComponentType<any>>(
    Component: T,
    propsAreEqual?: (
      prevProps: Readonly<ComponentProps<T>>,
      nextProps: Readonly<ComponentProps<T>>
    ) => boolean
  ): T & { displayName?: string };
}
