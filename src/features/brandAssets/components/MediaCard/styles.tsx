export const styles = theme => ({
  cardStyle: {
    minWidth: '288px',
    minHeight: '230px',
    borderRadius: '8px',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px',
    backgroundColor: '#363B63',
    height: '125px',
  },
  imageContainerWhite: {
    backgroundColor: '#F5F5FF',
  },
  cardImage: {
    maxWidth: '200px',
    maxHeight: '64px',
    width: 'auto',
    objectFit: 'contain' as const,
  },
  actionContainer: {
    padding: '24px',
  },
  description: {
    marginTop: '0',
    marginBottom: '10px',
  },
  actions: {
    display: 'flex',
    gap: theme.spacing(1),
  },
});
