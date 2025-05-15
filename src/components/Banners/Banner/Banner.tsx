import { memo } from 'react';
import Clear from '../../../images/icons/mui/Clear.svg?react';
import { bannerRecipe } from './styles.ts';
import type { BannerProps } from './types.ts';

export const Banner = memo<BannerProps>(function Banner({ icon, text, onClose, variant = 'info' }) {
  const classes = bannerRecipe({ variant });

  return (
    <div className={classes.banner}>
      <div className={classes.box}>
        <div className={classes.content}>
          {icon ?
            <div className={classes.icon}>{icon}</div>
          : null}
          <div className={classes.text}>{text}</div>
        </div>
        {onClose ?
          <Clear onClick={onClose} className={classes.cross} />
        : null}
      </div>
    </div>
  );
});
