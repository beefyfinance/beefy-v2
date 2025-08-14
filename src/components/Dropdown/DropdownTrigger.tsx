import { type ComponentProps, createElement, memo, type ReactHTML, type Ref } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { useDropdownContext } from './useDropdownContext.ts';
import { styled } from '@repo/styles/jsx';
import { buttonRecipe } from '../Button/styles.ts';

type HtmlTag = keyof ReactHTML;

function createDropdownTrigger<T extends HtmlTag>(tag: T) {
  const Component = function DropdownTrigger({ ref, ...props }: ComponentProps<T>) {
    const { getReferenceProps, refs, manualReference, hoverHandlers } = useDropdownContext();
    const mergedRef = useMergeRefs([
      manualReference ? undefined : refs.setReference,
      ref as Ref<HTMLElement>,
    ]);

    // Use custom hover handlers if available, otherwise fall back to default
    const triggerProps = hoverHandlers ? { ...props, ...hoverHandlers } : getReferenceProps(props);

    return createElement(tag, { ...triggerProps, ref: mergedRef });
  };

  Component.displayName = `DropdownTrigger.${tag}`;

  return memo(Component);
}

type DropdownTriggerFactory = {
  [K in HtmlTag]: ReturnType<typeof createDropdownTrigger<K>>;
};

function createDropdownTriggerFactory() {
  const cache = new Map<HtmlTag, ReturnType<typeof createDropdownTrigger<HtmlTag>>>();

  return new Proxy(createDropdownTrigger, {
    get(_, el: HtmlTag) {
      if (!cache.has(el)) {
        cache.set(el, createDropdownTrigger(el));
      }
      return cache.get(el);
    },
  }) as unknown as DropdownTriggerFactory;
}

export const DropdownTrigger = /* @__PURE__ */ createDropdownTriggerFactory();

export const DropdownButtonTrigger = /* @__PURE__ */ styled(DropdownTrigger.button, buttonRecipe);
