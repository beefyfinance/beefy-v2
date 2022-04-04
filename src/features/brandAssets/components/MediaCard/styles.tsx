export const styles = theme => ({
  cardStyle: {
    width: '288px',
    height: '230px',
    // margin: '10px 20px 10px 0',
    borderRadius: '8px',
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
    objectFit: 'contain',
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
