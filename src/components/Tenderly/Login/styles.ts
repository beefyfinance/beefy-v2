import { css } from '@repo/styles/css';

export const styles = {
  label: css.raw({
    textStyle: 'subline.sm',
    lineHeight: '1em',
  }),
  inputHelpHolder: css.raw({
    background: 'background.content.light',
    borderRadius: '8px',
  }),
  input: css.raw({
    textStyle: 'body',
    lineHeight: '20px',
    background: 'purpleDarkest',
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
    borderRadius: '8px',
    width: '100%',
    display: 'flex',
    padding: '12px 48px 12px 16px',
    color: 'text.light',
    height: 'auto',
  }),
  help: css.raw({
    textStyle: 'body.sm',
    padding: '12px 16px',
    fontSize: '16px',
    alignItems: 'center',
    color: 'text.middle',
  }),
  helpIcon: css.raw({
    width: '20',
    height: '20',
    display: 'block',
  }),
  helpText: css.raw({
    flex: '1 1 auto',
  }),
  helpLinkIcon: css.raw({
    width: '16',
    height: '16',
    display: 'block',
  }),
  helpLinkAnchor: css.raw({
    display: 'flex',
  }),
};
