import { memo } from 'react';
import { useAppSelector } from '../../../../store';
import { selectBoostPartnerById } from '../../../data/selectors/boosts';
import type { Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Socials } from './Socials';

const useStyles = makeStyles((theme: Theme) => ({
  partnerSubCard: {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.contentLight,
  },
  partnerHeader: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    padding: '16px',
    borderRadius: '12px 12px 0 0',
    backgroundColor: theme.palette.background.contentDark,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerContent: {
    padding: '16px',
  },
  partnerTitle: {
    ...theme.typography['h3'],
    margin: 0,
  },
  partnerText: {},
}));

type PartnerSubCardProps = {
  partnerId: string;
};

export const Partner = memo<PartnerSubCardProps>(function PartnerSubCard({ partnerId }) {
  const classes = useStyles();
  const { title, text, website, social } = useAppSelector(state =>
    selectBoostPartnerById(state, partnerId)
  );

  return (
    <div className={classes.partnerSubCard}>
      <div className={classes.partnerHeader}>
        <h4 className={classes.partnerTitle}>{title}</h4>
        <Socials website={website} socials={social} />
      </div>
      <div className={classes.partnerContent}>
        <div className={classes.partnerText}>{text}</div>
      </div>
    </div>
  );
});
