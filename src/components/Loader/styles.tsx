import circleLoader from '../../images/loader.gif';
import lineLoader from '../../images/loader2.gif';

export const styles = () => ({
  circle: {
    width: '48px',
    height: '48px',
    margin: '20px auto',
    backgroundImage: 'url(' + circleLoader + ')',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },

  line: {
    width: '48px',
    height: '12px',
    margin: '0',
    backgroundImage: 'url(' + lineLoader + ')',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  span: {
    display: 'block',
  },
});
