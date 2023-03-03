import * as React from 'react';
import { memo } from 'react';
import { RenBannerHome } from '../../../../components/Banners/RenBanner';
import { Container, makeStyles, Theme } from '@material-ui/core';
import { AnnouncementBanner } from '../../../../components/Banners/AnnouncementBanner';

const useStyles = makeStyles((theme: Theme) => ({
  banners: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    '& > :last-child': {
      marginBottom: '24px',
    },
  },
}));

export type BannersProps = {};
export const Banners = memo<BannersProps>(function () {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.banners}>
      <AnnouncementBanner />
      <RenBannerHome />
    </Container>
  );
});
