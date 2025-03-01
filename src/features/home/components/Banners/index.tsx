import { memo } from 'react';
import { BusdBannerHome } from '../../../../components/Banners/BusdBanner';
import { makeStyles } from '@material-ui/core';
// import { AnnouncementBanner } from '../../../../components/Banners/AnnouncementBanner';
import { UnstakedClmBanner } from '../../../../components/Banners/UnstakedClmBanner/UnstakedClmBanner';
import { Container } from '../../../../components/Container/Container';
import { theme } from '../../../../theme';

const useStyles = makeStyles(() => ({
  banners: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    [theme.breakpoints.down('sm')]: {
      padding: '0px 12px',
    },
    '& > :last-child': {
      marginBottom: '24px',
    },
  },
}));

export type BannersProps = object;
export const Banners = memo<BannersProps>(function Banners() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.banners}>
      {/* <AnnouncementBanner /> */}
      <UnstakedClmBanner />
      <BusdBannerHome />
    </Container>
  );
});
