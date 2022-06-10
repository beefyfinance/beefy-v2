export const styles = () => ({
  circle: {
    width: '48px',
    height: '48px',
    margin: '20px auto',
    backgroundImage: 'url(' + require('../../images/loader.gif').default + ')',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },

  line: {
    width: '48px',
    height: '12px',
    margin: '0',
    backgroundImage: 'url(' + require('../../images/loader2.gif').default + ')',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  span: {
    display: 'block',
  },
});
