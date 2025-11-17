import { type ComponentType, type CSSProperties, memo, type ReactNode, useRef } from 'react';
import { Shadow } from './Shadow.tsx';
import {
  useVerticalScrollShadows,
  type UseVerticalScrollShadowsProps,
} from './useVerticalScrollShadows.ts';
import { VerticalShadowContainer } from './VerticalShadowContainer.tsx';

type VerticalScrollShadowsProps = Pick<
  UseVerticalScrollShadowsProps,
  'scrollContainerRef' | 'visibleThreshold' | 'visibleThresholdUnits'
> & {
  topShadow?: boolean;
  bottomShadow?: boolean;
  shadowSize?: number;
  children: ReactNode;
  ContainerComponent?: ComponentType<{ children: ReactNode; style?: CSSProperties }>;
  backgroundColor?: CSSProperties['backgroundColor'];
};

export const VerticalScrollShadows = memo(function VerticalScrollShadows({
  scrollContainerRef,
  topShadow = true,
  bottomShadow = true,
  shadowSize = 55,
  visibleThreshold = shadowSize,
  visibleThresholdUnits = 'pixels',
  children,
  backgroundColor,
  ContainerComponent = VerticalShadowContainer,
}: VerticalScrollShadowsProps) {
  const topShadowRef = useRef<HTMLDivElement>(null);
  const bottomShadowRef = useRef<HTMLDivElement>(null);

  useVerticalScrollShadows({
    scrollContainerRef,
    topShadowRef,
    bottomShadowRef,
    visibleThreshold,
    visibleThresholdUnits,
  });

  return (
    <ContainerComponent
      style={backgroundColor ? ({ '--shadow-bg': backgroundColor } as CSSProperties) : undefined}
    >
      {topShadow && (
        <Shadow position="top" ref={topShadowRef} style={{ height: `${shadowSize}px` }} />
      )}
      {children}
      {bottomShadow && (
        <Shadow position="bottom" ref={bottomShadowRef} style={{ height: `${shadowSize}px` }} />
      )}
    </ContainerComponent>
  );
});
