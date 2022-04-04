export const styles = theme => ({
  cardStyle: {
    minWidth: '288px',
    minHeight: '230px',
    borderRadius: '8px',
    flexGrow: 1,
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '32px',
    backgroundColor: '#363B63',
    height: '125px',
  },
  cardImage: {
    maxWidth: '200px',
    maxHeight: '64px',
    width: 'auto',
    objectFit: 'contain' as 'contain',
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
    justifyContent: 'space-between',
  },
});
