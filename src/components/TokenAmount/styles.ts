export const styles = () => ({
  withTooltip: {
    textDecoration: 'underline 1px dotted',
    cursor: 'default' as const,
  },
  withOnClick: {
    '&:hover': {
      cursor: 'pointer' as const,
    },
  },
});
