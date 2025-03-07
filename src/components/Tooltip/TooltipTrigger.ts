import {
  type ComponentProps,
  createElement,
  forwardRef,
  memo,
  type ReactHTML,
  type Ref,
} from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { useTooltipContext } from './useTooltipContext.ts';

type HtmlTag = keyof ReactHTML;

function createTooltipTrigger<T extends HtmlTag>(tag: T) {
  const Component = function TooltipTrigger(props: ComponentProps<T>, ref: Ref<HTMLElement>) {
    const { getReferenceProps, refs } = useTooltipContext();
    const mergedRef = useMergeRefs([refs.setReference, ref]);
    return createElement(tag, { ...getReferenceProps(props), ref: mergedRef });
  };

  Component.displayName = `TooltipTrigger.${tag}`;

  return memo(forwardRef(Component));
}

type TooltipTriggerFactory = {
  [K in HtmlTag]: ReturnType<typeof createTooltipTrigger<K>>;
};

function createTooltipTriggerFactory() {
  const cache = new Map<HtmlTag, ReturnType<typeof createTooltipTrigger<HtmlTag>>>();

  return new Proxy(createTooltipTrigger, {
    get(_, el: HtmlTag) {
      if (!cache.has(el)) {
        cache.set(el, createTooltipTrigger(el));
      }
      return cache.get(el);
    },
  }) as unknown as TooltipTriggerFactory;
}

export const TooltipTrigger = /* @__PURE__ */ createTooltipTriggerFactory();
