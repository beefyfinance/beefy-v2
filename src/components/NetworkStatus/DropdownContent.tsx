import { styled } from '@repo/styles/jsx';
import { DropdownContent as BaseDropdownContent } from '../Dropdown/DropdownContent.tsx';

export const DropdownContent = styled(
  BaseDropdownContent,
  {
    base: {
      display: 'flex',
      flexDirection: 'column',
      width: '280px',
      maxWidth: '320px',
      padding: '0px',
      backgroundColor: 'background.content',
      sm: {
        width: '320px',
      },
    },
  },
  {
    defaultProps: {
      gap: 'none',
      children: null,
    },
  }
);
