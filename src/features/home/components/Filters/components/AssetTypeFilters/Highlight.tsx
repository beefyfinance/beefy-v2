import { styled } from '@repo/styles/jsx';

export const Highlight = styled('span', {
  base: {
    textStyle: 'body.sm',
    backgroundColor: 'tags.clm.background',
    color: 'tags.clm.text',
    padding: '0px 6px',
    borderRadius: '10px',
    height: '20px',
    position: 'absolute',
    top: '-2px',
    right: '0',
    transform: 'translate(50%, -50%)',
    pointerEvents: 'none',
    zIndex: 'highlight',
  },
});

export const HighlightHolder = styled('div', {
  base: {
    position: 'relative',
    display: 'inline-block',
    padding: '0 8px 0 0',
  },
});
