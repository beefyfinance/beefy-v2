import { memo } from 'react';
import { RenBannerHome } from '../../../../components/Banners/RenBanner';
import { Container, makeStyles } from '@material-ui/core';
// import { AnnouncementBanner } from '../../../../components/Banners/AnnouncementBanner';

const useStyles = makeStyles(() => ({
  banners: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
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
      <RenBannerHome />
      {/* <AnnouncementBanner /> */}
    </Container>
  );
});
