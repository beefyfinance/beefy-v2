import React, { memo, PropsWithChildren } from 'react';
import { InfoCardEntity } from '../../../data/entities/info-card';
import { selectInfoCardById } from '../../../data/selectors/info-cards';
import {
  Card,
  CardAction,
  CardActions,
  CardContent,
  CardHeader,
  CardSuperTitle,
  CardTitle,
} from '../Card';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppSelector } from '../../../../store';

const useStyles = makeStyles(styles);

type CardContentSectionProps = PropsWithChildren<InfoCardEntity['content'][0]>;
const CardContentSection = memo<CardContentSectionProps>(function ContentItem({ heading, text }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      {heading ? <h3 className={classes.sectionHeading}>{t(heading)}</h3> : null}
      <p className={classes.sectionText}>{t(text)}</p>
    </>
  );
});

type InfoCardProps = PropsWithChildren<{
  cardId: InfoCardEntity['id'];
}>;
export const InfoCard = memo<InfoCardProps>(function InfoCard({ cardId }) {
  const { t } = useTranslation();
  const card = useAppSelector(state => selectInfoCardById(state, cardId));

  return (
    <Card>
      <CardHeader>
        {card.supertitle ? <CardSuperTitle text={t(card.supertitle)} /> : null}
        <CardTitle title={t(card.title)} />
        {card.actions ? (
          <CardActions>
            {card.actions.map(action => (
              <CardAction type={action.type} href={action.url} text={t(action.text)} />
            ))}
          </CardActions>
        ) : null}
      </CardHeader>
      <CardContent>
        {card.content.map(content => (
          <CardContentSection
            key={content.text}
            heading={t(content.heading)}
            text={t(content.text)}
          />
        ))}
      </CardContent>
    </Card>
  );
});
