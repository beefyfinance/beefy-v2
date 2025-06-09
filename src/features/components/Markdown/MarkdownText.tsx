import Markdown, { type Components } from 'react-markdown';
import { memo, useMemo } from 'react';
import { MarkdownLink } from './MarkdownLink.tsx';

const markdownComponents: Components = {
  a: MarkdownLink,
};

export const MarkdownText = memo(function ({
  text,
  className,
  components = markdownComponents,
}: {
  text: string;
  className?: string;
  components?: Components;
}) {
  const allowedElements = useMemo(
    () => ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'strong', 'em', ...Object.keys(components)],
    [components]
  );

  return (
    <div className={className}>
      <Markdown children={text} components={components} allowedElements={allowedElements} />
    </div>
  );
});
