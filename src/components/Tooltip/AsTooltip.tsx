import type { TooltipOptions } from './types.ts';
import { cloneElement, memo, type ReactElement, type ReactNode, type Ref } from 'react';
import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipContent } from './TooltipContent.tsx';
import { useTooltipContext } from './useTooltipContext.ts';
import { useMergeRefs } from '@floating-ui/react';

export type AsTooltipProps = TooltipOptions & {
  content: ReactNode;
  children: ReactElement;
};

/**
 * @deprecated try to avoid this as it is not good practice to use cloneElement
 */
export const AsTooltip = memo(function AsTooltip({ children, content, ...rest }: AsTooltipProps) {
  return (
    <TooltipProvider {...rest}>
      <CloneTrigger element={children} />
      <TooltipContent>{content}</TooltipContent>
    </TooltipProvider>
  );
});

type CloneTriggerProps = {
  element: ReactElement;
};

type ElementWithRef = ReactElement & { ref?: Ref<HTMLElement> };

function isElementWithRef(element: ReactElement): element is ElementWithRef {
  return 'ref' in element;
}

const CloneTrigger = memo(function CloneTrigger({ element }: CloneTriggerProps) {
  if (!isElementWithRef(element)) {
    throw new Error('Tooltip child must be able to hold a ref');
  }
  const { getReferenceProps, refs } = useTooltipContext();
  const mergedRef = useMergeRefs([refs.setReference, element.ref]);
  // eslint-disable-next-line react-x/no-clone-element
  return cloneElement(element, { ...getReferenceProps(element.props), ref: mergedRef });
});
